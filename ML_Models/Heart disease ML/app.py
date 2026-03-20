import streamlit as st
import pandas as pd
import numpy as np
import joblib
import os

# Set page configuration
st.set_page_config(
    page_title="Heart Disease Prediction",
    page_icon="❤️",
    layout="wide"
)

# Get the directory where this script is located
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Load the trained model and preprocessing objects
@st.cache_resource
def load_models():
    model = joblib.load(os.path.join(SCRIPT_DIR, "xgb_heart_model.pkl"))
    scaler = joblib.load(os.path.join(SCRIPT_DIR, "scaler.pkl"))
    label_encoders = joblib.load(os.path.join(SCRIPT_DIR, "encoders.pkl"))
    num_imputer = joblib.load(os.path.join(SCRIPT_DIR, "num_imputer.pkl"))
    cat_imputer = joblib.load(os.path.join(SCRIPT_DIR, "cat_imputer.pkl"))
    return model, scaler, label_encoders, num_imputer, cat_imputer

try:
    model, scaler, label_encoders, num_imputer, cat_imputer = load_models()
    model_loaded = True
except Exception as e:
    st.error(f"⚠️ Error loading model: {e}")
    st.info("Please run model.py first to train and save the model.")
    model_loaded = False

# App title and description
st.title("❤️ Heart Disease Risk Prediction")
st.markdown("""
This application predicts the risk of heart disease based on patient information and medical test results.
Fill in the information below to get your risk assessment.
""")

if model_loaded:
    # Create two columns for better layout
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("📋 Personal Information")
        
        # Age input
        age = st.number_input(
            "Age (years)",
            min_value=1,
            max_value=120,
            value=50,
            help="Enter your age in years"
        )
        
        # Sex input
        sex = st.selectbox(
            "Sex",
            options=["Male", "Female"],
            help="Select your biological sex"
        )
        
        # Maximum heart rate
        thalch = st.number_input(
            "Maximum Heart Rate Achieved (bpm)",
            min_value=60,
            max_value=220,
            value=150,
            help="Maximum heart rate achieved during exercise or stress test"
        )
    
    with col2:
        st.subheader("🩺 Medical Test Results")
        
        # Resting blood pressure
        trestbps = st.number_input(
            "Resting Blood Pressure (mm Hg)",
            min_value=80,
            max_value=200,
            value=120,
            help="Blood pressure measured when at rest"
        )
        
        # Cholesterol
        chol = st.number_input(
            "Serum Cholesterol (mg/dl)",
            min_value=100,
            max_value=600,
            value=200,
            help="Total cholesterol level in blood"
        )
        
        # Fasting blood sugar
        fbs = st.selectbox(
            "Fasting Blood Sugar > 120 mg/dl",
            options=["No", "Yes"],
            help="Is your fasting blood sugar greater than 120 mg/dl?"
        )
    
    # Add some space
    st.markdown("---")
    
    # Predict button
    if st.button("🔍 Predict Heart Disease Risk", type="primary", use_container_width=True):
        # Prepare input data
        user_data = {
            'age': age,
            'sex': sex,
            'trestbps': trestbps,
            'chol': chol,
            'fbs': True if fbs == "Yes" else False,
            'thalch': thalch
        }
        
        # Create DataFrame
        user_df = pd.DataFrame([user_data])
        
        # Define feature columns
        categorical_cols = ['sex', 'fbs']
        numerical_cols = ['age', 'trestbps', 'chol', 'thalch']
        
        try:
            # Impute missing values
            user_df[numerical_cols] = num_imputer.transform(user_df[numerical_cols])
            user_df[categorical_cols] = cat_imputer.transform(user_df[categorical_cols])
            
            # Encode categorical columns
            for col in categorical_cols:
                user_df[col] = label_encoders[col].transform(user_df[col])
            
            # Scale features
            user_scaled = scaler.transform(user_df)
            
            # Make prediction
            prediction = model.predict(user_scaled)[0]
            pred_proba = model.predict_proba(user_scaled)[0]
            
            risk_probability = pred_proba[1] * 100  # Probability of heart disease
            
            # Display results
            st.markdown("---")
            st.subheader("📊 Prediction Results")
            
            # Create three columns for results
            res_col1, res_col2, res_col3 = st.columns(3)
            
            with res_col1:
                st.metric(
                    label="Risk Probability",
                    value=f"{risk_probability:.1f}%"
                )
            
            with res_col2:
                risk_level = "HIGH" if prediction == 1 else "LOW"
                st.metric(
                    label="Risk Level",
                    value=risk_level
                )
            
            with res_col3:
                confidence = max(pred_proba) * 100
                st.metric(
                    label="Confidence",
                    value=f"{confidence:.1f}%"
                )
            
            # Display detailed result with color coding
            st.markdown("---")
            
            if prediction == 1:
                st.error("⚠️ **HIGH RISK of Heart Disease**")
                st.markdown("""
                **Recommendation:** 
                - Consult with a cardiologist immediately
                - Schedule a comprehensive cardiac evaluation
                - Follow up with your healthcare provider
                - Consider lifestyle modifications (diet, exercise, stress management)
                """)
            else:
                st.success("✅ **LOW RISK of Heart Disease**")
                st.markdown("""
                **Recommendation:** 
                - Maintain a healthy lifestyle
                - Regular health check-ups
                - Monitor blood pressure and cholesterol levels
                - Stay physically active and eat a balanced diet
                """)
            
            # Risk factors information
            st.markdown("---")
            st.subheader("📈 Your Risk Factors")
            
            risk_factors = []
            
            if age > 45 and sex == "Male":
                risk_factors.append("Age > 45 (Male)")
            elif age > 55 and sex == "Female":
                risk_factors.append("Age > 55 (Female)")
            
            if trestbps > 140:
                risk_factors.append("High Blood Pressure (>140 mm Hg)")
            elif trestbps > 120:
                risk_factors.append("Elevated Blood Pressure (120-140 mm Hg)")
            
            if chol > 240:
                risk_factors.append("High Cholesterol (>240 mg/dl)")
            elif chol > 200:
                risk_factors.append("Borderline High Cholesterol (200-240 mg/dl)")
            
            if fbs == "Yes":
                risk_factors.append("High Fasting Blood Sugar (>120 mg/dl)")
            
            if thalch < 100:
                risk_factors.append("Low Maximum Heart Rate (<100 bpm)")
            
            if risk_factors:
                st.warning("⚠️ Identified Risk Factors:")
                for factor in risk_factors:
                    st.markdown(f"- {factor}")
            else:
                st.info("✅ No major risk factors identified")
            
        except Exception as e:
            st.error(f"Error making prediction: {e}")
    
    # Additional information
    st.markdown("---")
    st.info("""
    **Disclaimer:** This prediction is based on machine learning analysis and should not replace professional medical advice. 
    Always consult with healthcare professionals for accurate diagnosis and treatment.
    """)
    
    # Model information in sidebar
    with st.sidebar:
        st.header("ℹ️ About")
        st.markdown("""
        **Model Information:**
        - Algorithm: XGBoost Classifier
        - Features: 6 key indicators
        - Accuracy: ~73.4%
        
        **Features Used:**
        - Age
        - Sex
        - Resting Blood Pressure
        - Cholesterol Level
        - Fasting Blood Sugar
        - Maximum Heart Rate
        
        **Developer:** ML Models Team
        **Version:** 1.0
        """)
        
        st.markdown("---")
        st.markdown("### 🏥 Normal Ranges")
        st.markdown("""
        - **Blood Pressure:** <120/80 mm Hg
        - **Cholesterol:** <200 mg/dl
        - **Fasting Blood Sugar:** <100 mg/dl
        - **Resting Heart Rate:** 60-100 bpm
        """)
