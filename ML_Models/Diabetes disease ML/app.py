import streamlit as st
import pandas as pd
import numpy as np
import joblib
import os

# Set page configuration
st.set_page_config(
    page_title="Diabetes Risk Prediction",
    page_icon="🩺",
    layout="wide"
)

# Get the directory where this script is located
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Load the trained model and preprocessing objects
@st.cache_resource
def load_models():
    model = joblib.load(os.path.join(SCRIPT_DIR, "ensemble_diabetes_model.pkl"))
    scaler = joblib.load(os.path.join(SCRIPT_DIR, "scaler_diabetes.pkl"))
    num_imputer = joblib.load(os.path.join(SCRIPT_DIR, "num_imputer_diabetes.pkl"))
    return model, scaler, num_imputer

try:
    model, scaler, num_imputer = load_models()
    model_loaded = True
except Exception as e:
    st.error(f"⚠️ Error loading model: {e}")
    st.info("Please run model.py first to train and save the model.")
    model_loaded = False

# App title and description
st.title("🩺 Diabetes Risk Prediction")
st.markdown("""
This application predicts the risk of diabetes based on patient medical measurements and test results.
Fill in the information below to get your risk assessment.
""")

if model_loaded:
    # Create two columns for better layout
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("📋 Patient Information")
        
        # Age input
        age = st.number_input(
            "Age (years)",
            min_value=1,
            max_value=120,
            value=30,
            help="Enter your age in years"
        )
        
        # BMI
        bmi = st.number_input(
            "BMI (Body Mass Index)",
            min_value=10.0,
            max_value=70.0,
            value=25.0,
            step=0.1,
            help="BMI = Weight(kg) / Height(m)²"
        )
        
        # Diabetes Pedigree Function
        dpf = st.number_input(
            "Diabetes Pedigree Function",
            min_value=0.0,
            max_value=3.0,
            value=0.5,
            step=0.01,
            help="A function that scores likelihood of diabetes based on family history"
        )
        
        # Skin Thickness
        skin_thickness = st.number_input(
            "Skin Thickness (mm)",
            min_value=0,
            max_value=100,
            value=20,
            help="Triceps skin fold thickness in millimeters"
        )
    
    with col2:
        st.subheader("🩺 Laboratory Test Results")
        
        # Glucose Level
        glucose = st.number_input(
            "Glucose Level (mg/dL)",
            min_value=0,
            max_value=300,
            value=120,
            help="Plasma glucose concentration (fasting or 2 hours post-glucose)"
        )
        
        # Blood Pressure
        blood_pressure = st.number_input(
            "Blood Pressure (mm Hg)",
            min_value=0,
            max_value=200,
            value=70,
            help="Diastolic blood pressure (mm Hg)"
        )
        
        # Insulin
        insulin = st.number_input(
            "Insulin Level (mu U/ml)",
            min_value=0,
            max_value=900,
            value=80,
            help="2-Hour serum insulin (mu U/ml)"
        )
    
    # Add some space
    st.markdown("---")
    
    # Predict button
    if st.button("🔍 Predict Diabetes Risk", type="primary", use_container_width=True):
        # Prepare input data
        user_data = {
            'Glucose': glucose,
            'BloodPressure': blood_pressure,
            'SkinThickness': skin_thickness,
            'Insulin': insulin,
            'BMI': bmi,
            'DiabetesPedigreeFunction': dpf,
            'Age': age
        }
        
        # Create DataFrame
        user_df = pd.DataFrame([user_data])
        
        # Define feature columns that might have zeros replaced with NaN
        zero_cols = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']
        
        try:
            # Impute any zero or missing values
            user_df[zero_cols] = num_imputer.transform(user_df[zero_cols])
            
            # Scale features
            user_scaled = scaler.transform(user_df)
            
            # Make prediction
            prediction = model.predict(user_scaled)[0]
            pred_proba = model.predict_proba(user_scaled)[0]
            
            risk_probability = pred_proba[1] * 100  # Probability of diabetes
            
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
                st.error("⚠️ **HIGH RISK of Diabetes**")
                st.markdown("""
                **Recommendation:** 
                - Consult with an endocrinologist or diabetologist immediately
                - Get a comprehensive diabetes screening (HbA1c test)
                - Monitor blood sugar levels regularly
                - Follow a diabetes-friendly diet plan
                - Increase physical activity
                - Maintain a healthy weight
                - Consider working with a certified diabetes educator
                """)
            else:
                st.success("✅ **LOW RISK of Diabetes**")
                st.markdown("""
                **Recommendation:** 
                - Maintain a healthy balanced diet
                - Regular physical activity (at least 150 min/week)
                - Annual health check-ups
                - Monitor weight and BMI
                - Limit sugar and refined carbohydrate intake
                - Stay hydrated
                """)
            
            # Risk factors information
            st.markdown("---")
            st.subheader("📈 Your Risk Factors Analysis")
            
            risk_factors = []
            protective_factors = []
            
            # Age factor
            if age > 45:
                risk_factors.append(f"Age: {age} years (Risk increases after 45)")
            elif age < 45:
                protective_factors.append(f"Age: {age} years (Below high-risk age)")
            
            # BMI factor
            if bmi >= 30:
                risk_factors.append(f"BMI: {bmi:.1f} (Obese - BMI ≥ 30)")
            elif bmi >= 25:
                risk_factors.append(f"BMI: {bmi:.1f} (Overweight - BMI 25-29.9)")
            else:
                protective_factors.append(f"BMI: {bmi:.1f} (Normal weight)")
            
            # Glucose factor
            if glucose >= 126:
                risk_factors.append(f"Glucose: {glucose} mg/dL (Diabetic range ≥ 126)")
            elif glucose >= 100:
                risk_factors.append(f"Glucose: {glucose} mg/dL (Pre-diabetic range 100-125)")
            else:
                protective_factors.append(f"Glucose: {glucose} mg/dL (Normal range)")
            
            # Blood pressure factor
            if blood_pressure >= 90:
                risk_factors.append(f"Blood Pressure: {blood_pressure} mm Hg (High ≥ 90)")
            elif blood_pressure >= 80:
                risk_factors.append(f"Blood Pressure: {blood_pressure} mm Hg (Elevated 80-89)")
            else:
                protective_factors.append(f"Blood Pressure: {blood_pressure} mm Hg (Normal)")
            
            # Insulin factor
            if insulin > 150:
                risk_factors.append(f"Insulin: {insulin} mu U/ml (Elevated levels)")
            
            # Diabetes Pedigree Function
            if dpf > 0.8:
                risk_factors.append(f"Family History Score: {dpf:.2f} (Strong family history)")
            elif dpf > 0.5:
                risk_factors.append(f"Family History Score: {dpf:.2f} (Moderate family history)")
            else:
                protective_factors.append(f"Family History Score: {dpf:.2f} (Low family history)")
            
            # Display risk factors
            if risk_factors:
                st.warning("⚠️ Identified Risk Factors:")
                for factor in risk_factors:
                    st.markdown(f"- {factor}")
            else:
                st.success("✅ No major risk factors identified")
            
            # Display protective factors
            if protective_factors:
                st.info("💪 Positive Health Indicators:")
                for factor in protective_factors:
                    st.markdown(f"- {factor}")
            
            # Educational information
            st.markdown("---")
            st.subheader("📚 Understanding Your Results")
            
            with st.expander("What is Diabetes?"):
                st.markdown("""
                Diabetes is a chronic condition that affects how your body processes blood sugar (glucose).
                There are three main types:
                - **Type 1 Diabetes**: Your body doesn't produce insulin
                - **Type 2 Diabetes**: Your body doesn't use insulin properly (most common)
                - **Gestational Diabetes**: Occurs during pregnancy
                
                This model primarily detects risk for Type 2 Diabetes.
                """)
            
            with st.expander("What is BMI?"):
                st.markdown("""
                Body Mass Index (BMI) is a measure of body fat based on height and weight.
                
                **BMI Categories:**
                - Under 18.5: Underweight
                - 18.5 - 24.9: Normal weight
                - 25.0 - 29.9: Overweight
                - 30.0 and above: Obese
                
                Higher BMI is associated with increased diabetes risk.
                """)
            
            with st.expander("What is Diabetes Pedigree Function?"):
                st.markdown("""
                The Diabetes Pedigree Function provides a synthesis of diabetes history in relatives
                and the genetic relationship to those relatives.
                
                - Higher values indicate stronger family history of diabetes
                - It considers both the number of diabetic relatives and how closely related they are
                - Values typically range from 0.08 to 2.42
                """)
            
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
        - Algorithm: Ensemble (XGBoost + Random Forest)
        - Features: 7 key indicators
        - Accuracy: ~78%+
        
        **Features Used:**
        1. Glucose Level
        2. Blood Pressure
        3. Skin Thickness
        4. Insulin Level
        5. BMI
        6. Diabetes Pedigree Function
        7. Age
        
        **Developer:** ML Models Team
        **Version:** 1.0
        """)
        
        st.markdown("---")
        st.markdown("### 🏥 Normal Ranges")
        st.markdown("""
        - **Fasting Glucose:** 70-99 mg/dL
        - **Blood Pressure:** <80 mm Hg (diastolic)
        - **BMI:** 18.5-24.9
        - **Insulin:** 16-166 mu U/ml
        - **Skin Fold:** 10-50 mm
        """)
        
        st.markdown("---")
        st.markdown("### 📞 Need Help?")
        st.markdown("""
        If you have concerns about your diabetes risk:
        - Consult your primary care physician
        - Schedule a diabetes screening
        - Contact a certified diabetes educator
        """)
