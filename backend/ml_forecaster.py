import os
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import joblib
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from xgboost import XGBRegressor
from sklearn.metrics import mean_squared_error, r2_score
import matplotlib.pyplot as plt
import requests
import time

class AirQualityForecaster:
    def __init__(self, model_dir='models'):
        """Initialize the Air Quality Forecaster with model directory"""
        self.model_dir = model_dir
        self.model_path = os.path.join(model_dir, 'xgb_air_quality_model.joblib')
        self.scaler_path = os.path.join(model_dir, 'air_quality_scaler.joblib')
        
        # Create model directory if it doesn't exist
        if not os.path.exists(model_dir):
            os.makedirs(model_dir)
        
        # Initialize model and scaler
        self.model = None
        self.scaler = None
        
        # Load model if exists
        self.load_model()
    
    def load_model(self):
        """Load the model and scaler if they exist"""
        try:
            if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
                self.model = joblib.load(self.model_path)
                self.scaler = joblib.load(self.scaler_path)
                print("Model and scaler loaded successfully")
                return True
            else:
                print("Model or scaler not found, need to train new model")
                return False
        except Exception as e:
            print(f"Error loading model: {e}")
            return False

    def prepare_historical_data(self, historical_data):
        """
        Prepare historical air quality data for modeling
        
        Args:
            historical_data: List of dictionaries with air quality metrics
        
        Returns:
            DataFrame with features and target variables
        """
        # Convert to DataFrame
        df = pd.DataFrame(historical_data)
        
        # Convert timestamp to datetime
        df['datetime'] = pd.to_datetime(df['timestamp'])
        
        # Extract temporal features
        df['hour'] = df['datetime'].dt.hour
        df['day'] = df['datetime'].dt.day
        df['month'] = df['datetime'].dt.month
        df['day_of_week'] = df['datetime'].dt.dayofweek
        df['is_weekend'] = df['day_of_week'].apply(lambda x: 1 if x >= 5 else 0)
        
        # Create lagged features
        for lag in [1, 3, 6, 12, 24]:
            df[f'aqi_lag_{lag}h'] = df['aqi'].shift(lag)
            df[f'pm25_lag_{lag}h'] = df['pm25'].shift(lag)
        
        # Drop rows with NaN (resulting from lag operations)
        df = df.dropna()
        
        # Feature engineering: calculate rolling averages
        df['aqi_rolling_6h'] = df['aqi'].rolling(window=6).mean().shift(1)
        df['aqi_rolling_12h'] = df['aqi'].rolling(window=12).mean().shift(1)
        df['aqi_rolling_24h'] = df['aqi'].rolling(window=24).mean().shift(1)
        
        # Drop NaN values after rolling calculations
        df = df.dropna()
        
        return df
    
    def create_features_targets(self, df):
        """
        Split dataframe into features and targets
        
        Args:
            df: Prepared DataFrame
            
        Returns:
            X: Feature DataFrame
            y_aqi: AQI target Series
            y_pm25: PM2.5 target Series
        """
        # Define features to use
        feature_cols = [
            'hour', 'day', 'month', 'day_of_week', 'is_weekend',
            'aqi_lag_1h', 'aqi_lag_3h', 'aqi_lag_6h', 'aqi_lag_12h', 'aqi_lag_24h',
            'pm25_lag_1h', 'pm25_lag_3h', 'pm25_lag_6h', 'pm25_lag_12h', 'pm25_lag_24h',
            'aqi_rolling_6h', 'aqi_rolling_12h', 'aqi_rolling_24h'
        ]
        
        # Check if all features are present
        for col in feature_cols:
            if col not in df.columns:
                print(f"Missing feature column: {col}")
                feature_cols.remove(col)
        
        # Feature matrix
        X = df[feature_cols]
        
        # Target variables
        y_aqi = df['aqi']
        y_pm25 = df['pm25']
        
        return X, y_aqi, y_pm25
    
    def train_model(self, historical_data, save_model=True):
        """
        Train an XGBoost model on historical air quality data
        
        Args:
            historical_data: List of dictionaries with air quality metrics
            save_model: Boolean to save the model after training
            
        Returns:
            Dictionary with training results and metrics
        """
        try:
            # Prepare data
            df = self.prepare_historical_data(historical_data)
            
            # Split into features and targets
            X, y_aqi, y_pm25 = self.create_features_targets(df)
            
            # Split data into train and validation sets
            X_train, X_val, y_aqi_train, y_aqi_val = train_test_split(
                X, y_aqi, test_size=0.2, random_state=42
            )
            
            # Standardize features
            self.scaler = StandardScaler()
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_val_scaled = self.scaler.transform(X_val)
            
            # Train XGBoost model for AQI prediction
            self.model = XGBRegressor(
                n_estimators=200,
                learning_rate=0.1,
                max_depth=5,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=42
            )
            
            # Fit model
            self.model.fit(
                X_train_scaled, y_aqi_train,
                eval_set=[(X_val_scaled, y_aqi_val)],
                early_stopping_rounds=20,
                verbose=False
            )
            
            # Make predictions on validation set
            y_aqi_pred = self.model.predict(X_val_scaled)
            
            # Calculate metrics
            mse = mean_squared_error(y_aqi_val, y_aqi_pred)
            rmse = np.sqrt(mse)
            r2 = r2_score(y_aqi_val, y_aqi_pred)
            
            # Save the model and scaler if requested
            if save_model:
                # Save model directory if it doesn't exist
                if not os.path.exists(self.model_dir):
                    os.makedirs(self.model_dir)
                
                joblib.dump(self.model, self.model_path)
                joblib.dump(self.scaler, self.scaler_path)
                print(f"Model and scaler saved to {self.model_dir}")
            
            # Return results
            return {
                "status": "success",
                "metrics": {
                    "mse": mse,
                    "rmse": rmse,
                    "r2": r2
                },
                "feature_importance": {
                    name: importance for name, importance in 
                    zip(X.columns, self.model.feature_importances_)
                }
            }
        
        except Exception as e:
            print(f"Error training model: {e}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    def prepare_forecast_features(self, current_data, weather_forecast):
        """
        Prepare features for forecasting
        
        Args:
            current_data: Dictionary with current air quality
            weather_forecast: Dictionary with weather forecast
            
        Returns:
            DataFrame with features for prediction
        """
        # Get current timestamp
        now = datetime.now()
        
        # Create forecast dataframe with a row for each hour
        forecast_hours = 168  # 7 days
        dates = [now + timedelta(hours=i) for i in range(forecast_hours)]
        
        # Create empty dataframe
        df = pd.DataFrame({
            'datetime': dates,
            'hour': [d.hour for d in dates],
            'day': [d.day for d in dates],
            'month': [d.month for d in dates],
            'day_of_week': [d.weekday() for d in dates],
            'is_weekend': [1 if d.weekday() >= 5 else 0 for d in dates]
        })
        
        # Fill in lag features with most recent data
        for idx, row in df.iterrows():
            if idx == 0:  # First hour uses current data
                df.loc[idx, 'aqi_lag_1h'] = current_data.get('aqi', 100)
                df.loc[idx, 'pm25_lag_1h'] = current_data.get('pm25', 30)
                
                # For longer lags, use historical averages if not available
                df.loc[idx, 'aqi_lag_3h'] = current_data.get('aqi_lag_3h', current_data.get('aqi', 100))
                df.loc[idx, 'aqi_lag_6h'] = current_data.get('aqi_lag_6h', current_data.get('aqi', 100))
                df.loc[idx, 'aqi_lag_12h'] = current_data.get('aqi_lag_12h', current_data.get('aqi', 100))
                df.loc[idx, 'aqi_lag_24h'] = current_data.get('aqi_lag_24h', current_data.get('aqi', 100))
                
                df.loc[idx, 'pm25_lag_3h'] = current_data.get('pm25_lag_3h', current_data.get('pm25', 30))
                df.loc[idx, 'pm25_lag_6h'] = current_data.get('pm25_lag_6h', current_data.get('pm25', 30))
                df.loc[idx, 'pm25_lag_12h'] = current_data.get('pm25_lag_12h', current_data.get('pm25', 30))
                df.loc[idx, 'pm25_lag_24h'] = current_data.get('pm25_lag_24h', current_data.get('pm25', 30))
                
                df.loc[idx, 'aqi_rolling_6h'] = current_data.get('aqi_rolling_6h', current_data.get('aqi', 100))
                df.loc[idx, 'aqi_rolling_12h'] = current_data.get('aqi_rolling_12h', current_data.get('aqi', 100))
                df.loc[idx, 'aqi_rolling_24h'] = current_data.get('aqi_rolling_24h', current_data.get('aqi', 100))
            else:
                # Use predictions from previous hours as lag features
                if idx >= 1:
                    df.loc[idx, 'aqi_lag_1h'] = df.loc[idx-1, 'predicted_aqi']
                    df.loc[idx, 'pm25_lag_1h'] = df.loc[idx-1, 'predicted_pm25']
                
                if idx >= 3:
                    df.loc[idx, 'aqi_lag_3h'] = df.loc[idx-3, 'predicted_aqi']
                    df.loc[idx, 'pm25_lag_3h'] = df.loc[idx-3, 'predicted_pm25']
                else:
                    df.loc[idx, 'aqi_lag_3h'] = df.loc[0, 'aqi_lag_3h']
                    df.loc[idx, 'pm25_lag_3h'] = df.loc[0, 'pm25_lag_3h']
                
                if idx >= 6:
                    df.loc[idx, 'aqi_lag_6h'] = df.loc[idx-6, 'predicted_aqi']
                    df.loc[idx, 'pm25_lag_6h'] = df.loc[idx-6, 'predicted_pm25']
                else:
                    df.loc[idx, 'aqi_lag_6h'] = df.loc[0, 'aqi_lag_6h']
                    df.loc[idx, 'pm25_lag_6h'] = df.loc[0, 'pm25_lag_6h']
                
                if idx >= 12:
                    df.loc[idx, 'aqi_lag_12h'] = df.loc[idx-12, 'predicted_aqi']
                    df.loc[idx, 'pm25_lag_12h'] = df.loc[idx-12, 'predicted_pm25']
                else:
                    df.loc[idx, 'aqi_lag_12h'] = df.loc[0, 'aqi_lag_12h']
                    df.loc[idx, 'pm25_lag_12h'] = df.loc[0, 'pm25_lag_12h']
                
                if idx >= 24:
                    df.loc[idx, 'aqi_lag_24h'] = df.loc[idx-24, 'predicted_aqi']
                    df.loc[idx, 'pm25_lag_24h'] = df.loc[idx-24, 'predicted_pm25']
                else:
                    df.loc[idx, 'aqi_lag_24h'] = df.loc[0, 'aqi_lag_24h']
                    df.loc[idx, 'pm25_lag_24h'] = df.loc[0, 'pm25_lag_24h']
                
                # Calculate rolling averages
                if idx >= 6:
                    df.loc[idx, 'aqi_rolling_6h'] = df.loc[idx-6:idx-1, 'predicted_aqi'].mean()
                else:
                    df.loc[idx, 'aqi_rolling_6h'] = df.loc[0, 'aqi_rolling_6h']
                
                if idx >= 12:
                    df.loc[idx, 'aqi_rolling_12h'] = df.loc[idx-12:idx-1, 'predicted_aqi'].mean()
                else:
                    df.loc[idx, 'aqi_rolling_12h'] = df.loc[0, 'aqi_rolling_12h']
                
                if idx >= 24:
                    df.loc[idx, 'aqi_rolling_24h'] = df.loc[idx-24:idx-1, 'predicted_aqi'].mean()
                else:
                    df.loc[idx, 'aqi_rolling_24h'] = df.loc[0, 'aqi_rolling_24h']
        
        return df
    
    def generate_forecast(self, current_data, weather_forecast=None):
        """
        Generate forecasts using the trained model
        
        Args:
            current_data: Dictionary with current air quality metrics
            weather_forecast: Optional weather forecast data
            
        Returns:
            List of dictionaries with forecasted values
        """
        try:
            if self.model is None or self.scaler is None:
                raise Exception("Model or scaler not loaded. Train or load a model first.")
            
            # Prepare features for forecasting
            forecast_df = self.prepare_forecast_features(current_data, weather_forecast)
            
            # Features needed for prediction
            feature_cols = [
                'hour', 'day', 'month', 'day_of_week', 'is_weekend',
                'aqi_lag_1h', 'aqi_lag_3h', 'aqi_lag_6h', 'aqi_lag_12h', 'aqi_lag_24h',
                'pm25_lag_1h', 'pm25_lag_3h', 'pm25_lag_6h', 'pm25_lag_12h', 'pm25_lag_24h',
                'aqi_rolling_6h', 'aqi_rolling_12h', 'aqi_rolling_24h'
            ]
            
            # Make predictions iteratively to incorporate previous predictions
            for idx in range(len(forecast_df)):
                # Get features for current hour
                X = forecast_df.loc[idx:idx, feature_cols]
                
                # Scale features
                X_scaled = self.scaler.transform(X)
                
                # Predict AQI
                aqi_pred = self.model.predict(X_scaled)[0]
                
                # Estimate PM2.5 (approximate relationship with AQI)
                # This is a simplified relationship - for a real model, you'd train a separate model
                if aqi_pred <= 50:
                    pm25_pred = aqi_pred * 0.2
                elif aqi_pred <= 100:
                    pm25_pred = 10 + (aqi_pred - 50) * 0.5
                elif aqi_pred <= 150:
                    pm25_pred = 35 + (aqi_pred - 100) * 0.42
                elif aqi_pred <= 200:
                    pm25_pred = 55 + (aqi_pred - 150) * 0.58
                elif aqi_pred <= 300:
                    pm25_pred = 150 + (aqi_pred - 200) * 1.0
                else:
                    pm25_pred = 250 + (aqi_pred - 300) * 0.8
                
                # Store predictions
                forecast_df.loc[idx, 'predicted_aqi'] = round(max(0, aqi_pred))
                forecast_df.loc[idx, 'predicted_pm25'] = round(max(0, pm25_pred), 1)
            
            # Group forecasts by day
            forecast_df['date'] = forecast_df['datetime'].dt.strftime('%a, %b %d')
            
            # Extract daily forecasts (max AQI and average pollutants)
            daily_forecasts = []
            for date, group in forecast_df.groupby('date'):
                daily_forecasts.append({
                    'date': date,
                    'aqi_max': int(round(group['predicted_aqi'].max())),
                    'aqi_min': int(round(group['predicted_aqi'].min())),
                    'pollutants': {
                        'pm25': round(group['predicted_pm25'].mean(), 1),
                        'pm10': round(group['predicted_pm25'].mean() * 1.5, 1),  # Estimated
                        'o3': 40 + round(group['predicted_aqi'].mean() * 0.2, 1),  # Estimated
                        'no2': 20 + round(group['predicted_aqi'].mean() * 0.15, 1)  # Estimated
                    }
                })
            
            return daily_forecasts
            
        except Exception as e:
            print(f"Error generating forecast: {e}")
            return None
    
    def get_hourly_forecast(self, current_data, weather_forecast=None):
        """
        Get hourly forecast for the next 24 hours
        
        Args:
            current_data: Dictionary with current air quality metrics
            weather_forecast: Optional weather forecast data
            
        Returns:
            List of dictionaries with hourly forecasted values
        """
        try:
            if self.model is None or self.scaler is None:
                raise Exception("Model or scaler not loaded. Train or load a model first.")
            
            # Prepare features for forecasting
            forecast_df = self.prepare_forecast_features(current_data, weather_forecast)
            
            # Only keep first 24 hours
            forecast_df = forecast_df.iloc[:24]
            
            # Features needed for prediction
            feature_cols = [
                'hour', 'day', 'month', 'day_of_week', 'is_weekend',
                'aqi_lag_1h', 'aqi_lag_3h', 'aqi_lag_6h', 'aqi_lag_12h', 'aqi_lag_24h',
                'pm25_lag_1h', 'pm25_lag_3h', 'pm25_lag_6h', 'pm25_lag_12h', 'pm25_lag_24h',
                'aqi_rolling_6h', 'aqi_rolling_12h', 'aqi_rolling_24h'
            ]
            
            # Make predictions iteratively
            for idx in range(len(forecast_df)):
                # Get features for current hour
                X = forecast_df.loc[idx:idx, feature_cols]
                
                # Scale features
                X_scaled = self.scaler.transform(X)
                
                # Predict AQI
                aqi_pred = self.model.predict(X_scaled)[0]
                
                # Estimate PM2.5 (approximate relationship with AQI)
                if aqi_pred <= 50:
                    pm25_pred = aqi_pred * 0.2
                elif aqi_pred <= 100:
                    pm25_pred = 10 + (aqi_pred - 50) * 0.5
                else:
                    pm25_pred = 35 + (aqi_pred - 100) * 0.5
                
                # Store predictions
                forecast_df.loc[idx, 'predicted_aqi'] = round(max(0, aqi_pred))
                forecast_df.loc[idx, 'predicted_pm25'] = round(max(0, pm25_pred), 1)
            
            # Format the hourly forecast for API response
            hourly_forecast = []
            for idx, row in forecast_df.iterrows():
                hourly_forecast.append({
                    'timestamp': row['datetime'].strftime('%H:%M'),
                    'hour': row['datetime'].strftime('%H'),
                    'aqi': int(row['predicted_aqi']),
                    'pm25': float(row['predicted_pm25'])
                })
                
            return hourly_forecast
        
        except Exception as e:
            print(f"Error generating hourly forecast: {e}")
            return None 