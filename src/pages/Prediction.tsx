import { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Activity, AlertTriangle, CheckCircle, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';

type ModelType = 'heart' | 'diabetes' | 'hypertension' | 'ckd' | 'asthma' | 'arthritis' | 'copd' | 'liver';
type RiskLevel = 'low' | 'moderate' | 'high';
type FormValue = string | number;

interface FieldOption {
    label: string;
    value: string;
}

interface FieldConfig {
    key: string;
    label: string;
    type: 'number' | 'select';
    placeholder?: string;
    helpText?: string;
    options?: FieldOption[];
    step?: number;
    min?: number;
    max?: number;
}

interface ModelConfig {
    title: string;
    subtitle: string;
    fields: FieldConfig[];
}

interface RiskResult {
    percentage: number;
    confidence: number;
    level: RiskLevel;
    explanation: string;
    prediction: number;
    modelLabel: string;
}

interface AutomatedMetrics {
    age: number;
    sex: number;
    resting_bp: number;
    cholesterol: number;
    fasting_blood_sugar: number;
    max_heart_rate: number;
    exercise_angina: number;
    bmi: number;
}

const ML_API_BASE_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:8000';

const MODEL_OPTIONS: Array<{ value: ModelType; label: string }> = [
    { value: 'heart', label: 'Heart Disease' },
    { value: 'diabetes', label: 'Diabetes' },
    { value: 'hypertension', label: 'Hypertension' },
    { value: 'ckd', label: 'Chronic Kidney Disease (CKD)' },
    { value: 'asthma', label: 'Asthma' },
    { value: 'arthritis', label: 'Arthritis' },
    { value: 'copd', label: 'COPD' },
    { value: 'liver', label: 'Liver Disease' },
];

const YES_NO_OPTIONS: FieldOption[] = [
    { label: 'No', value: 'No' },
    { label: 'Yes', value: 'Yes' },
];

const GENDER_OPTIONS: FieldOption[] = [
    { label: 'Female', value: 'Female' },
    { label: 'Male', value: 'Male' },
];

const SEVERITY_OPTIONS: FieldOption[] = [
    { label: 'No', value: 'No' },
    { label: 'Mild', value: 'Mild' },
    { label: 'Moderate', value: 'Moderate' },
    { label: 'Severe', value: 'Severe' },
];

const MODEL_CONFIGS: Record<ModelType, ModelConfig> = {
    heart: {
        title: 'Heart Disease Prediction',
        subtitle: 'Cardiovascular risk assessment using clinical heart metrics.',
        fields: [
            { key: 'age', label: 'Age (years)', type: 'number', placeholder: 'e.g., 45', min: 1, max: 120, helpText: 'Chronological age at assessment.' },
            { key: 'sex', label: 'Biological Sex', type: 'select', options: GENDER_OPTIONS, helpText: 'Encoded by the model as categorical cardiovascular risk factor.' },
            { key: 'trestbps', label: 'Resting Systolic BP, Trestbps (mmHg)', type: 'number', placeholder: 'e.g., 120', min: 70, max: 230, helpText: 'Measured at rest after at least 5 minutes seated.' },
            { key: 'chol', label: 'Serum Total Cholesterol, Chol (mg/dL)', type: 'number', placeholder: 'e.g., 180', min: 80, max: 700, helpText: 'Fasting lipid value improves reliability.' },
            {
                key: 'fbs',
                label: 'Fasting Blood Sugar > 120 mg/dL (FBS)',
                type: 'select',
                helpText: 'Binary threshold feature used directly in model training.',
                options: [
                    { label: 'False', value: 'False' },
                    { label: 'True', value: 'True' },
                ],
            },
            { key: 'thalch', label: 'Maximum Predicted HR, Thalach (bpm)', type: 'number', placeholder: 'e.g., 150', min: 60, max: 230, helpText: 'Peak heart rate observed or clinically estimated under exertion.' },
        ],
    },
    diabetes: {
        title: 'Diabetes Prediction',
        subtitle: 'Glycemic and metabolic pattern prediction.',
        fields: [
            { key: 'glucose', label: 'Plasma Glucose Concentration (mg/dL)', type: 'number', placeholder: 'e.g., 130', min: 40, max: 400, helpText: 'Prefer fasting or standardized OGTT measurement.' },
            { key: 'bloodPressure', label: 'Diastolic BP (mmHg)', type: 'number', placeholder: 'e.g., 80', min: 30, max: 180, helpText: 'Model was trained with diastolic component in mmHg.' },
            { key: 'skinThickness', label: 'Triceps Skinfold Thickness (mm)', type: 'number', placeholder: 'e.g., 25', min: 1, max: 120, helpText: 'Anthropometric adiposity marker.' },
            { key: 'insulin', label: '2-Hour Serum Insulin (mu U/ml)', type: 'number', placeholder: 'e.g., 120', min: 1, max: 1000, helpText: 'Post-load insulin improves glucose-insulin feature interaction.' },
            { key: 'bmi', label: 'Body Mass Index (kg/m²)', type: 'number', placeholder: 'e.g., 26.4', min: 10, max: 80, step: 0.1, helpText: 'Weight/height²; include one decimal place.' },
            { key: 'diabetesPedigreeFunction', label: 'Diabetes Pedigree Function (DPF)', type: 'number', placeholder: 'e.g., 0.627', min: 0.05, max: 3, step: 0.001, helpText: 'Genetic predisposition score used in Pima-style datasets.' },
            { key: 'age', label: 'Age (years)', type: 'number', placeholder: 'e.g., 45', min: 1, max: 120, helpText: 'Chronological age at screening.' },
        ],
    },
    hypertension: {
        title: 'Hypertension Prediction',
        subtitle: 'Blood pressure and lifestyle risk classification.',
        fields: [
            { key: 'Systolic_BP', label: 'Systolic BP (mmHg)', type: 'number', placeholder: 'e.g., 130', min: 70, max: 260, helpText: 'Upper arterial pressure during ventricular contraction.' },
            { key: 'Diastolic_BP', label: 'Diastolic BP (mmHg)', type: 'number', placeholder: 'e.g., 85', min: 40, max: 180, helpText: 'Lower arterial pressure during relaxation phase.' },
            { key: 'Heart_Rate', label: 'Resting Heart Rate (bpm)', type: 'number', placeholder: 'e.g., 78', min: 35, max: 220, helpText: 'Measured in resting state.' },
            { key: 'BMI', label: 'Body Mass Index (kg/m²)', type: 'number', placeholder: 'e.g., 28.4', min: 10, max: 80, step: 0.1, helpText: 'Cardiometabolic risk surrogate.' },
            { key: 'Age', label: 'Age (years)', type: 'number', placeholder: 'e.g., 50', min: 1, max: 120, helpText: 'Age-associated vascular stiffness risk factor.' },
            { key: 'Gender', label: 'Biological Sex', type: 'select', options: GENDER_OPTIONS, helpText: 'Categorical feature used by model encoder.' },
        ],
    },
    ckd: {
        title: 'CKD Prediction',
        subtitle: 'Kidney function risk based on blood and clinical markers.',
        fields: [
            { key: 'age', label: 'Age (years)', type: 'number', placeholder: 'e.g., 55', min: 1, max: 120, helpText: 'CKD prevalence rises with age.' },
            { key: 'bp', label: 'Blood Pressure (mmHg)', type: 'number', placeholder: 'e.g., 90', min: 40, max: 250, helpText: 'Clinic-measured arterial pressure.' },
            { key: 'bgr', label: 'Blood Glucose Random, BGR (mg/dL)', type: 'number', placeholder: 'e.g., 150', min: 20, max: 500, helpText: 'Random plasma glucose at collection time.' },
            { key: 'bu', label: 'Blood Urea, BU (mg/dL)', type: 'number', placeholder: 'e.g., 40', min: 1, max: 300, helpText: 'Nitrogenous waste marker.' },
            { key: 'sc', label: 'Serum Creatinine, SC (mg/dL)', type: 'number', placeholder: 'e.g., 1.2', min: 0.1, max: 25, step: 0.1, helpText: 'Primary renal filtration marker.' },
            { key: 'hemo', label: 'Hemoglobin, Hemo (g/dL)', type: 'number', placeholder: 'e.g., 13.5', min: 2, max: 22, step: 0.1, helpText: 'Anemia can correlate with renal dysfunction.' },
            { key: 'htn', label: 'HTN Comorbidity Present', type: 'select', options: YES_NO_OPTIONS, helpText: 'Hypertension status as categorical comorbidity.' },
        ],
    },
    asthma: {
        title: 'Asthma Prediction',
        subtitle: 'Respiratory symptom and exposure-based risk estimation.',
        fields: [
            { key: 'Age', label: 'Age (years)', type: 'number', placeholder: 'e.g., 32', min: 1, max: 120, helpText: 'Age can alter airway hyperresponsiveness profile.' },
            { key: 'Gender', label: 'Biological Sex', type: 'select', options: GENDER_OPTIONS, helpText: 'Categorical sex-linked prevalence pattern.' },
            { key: 'BMI', label: 'Body Mass Index (kg/m²)', type: 'number', placeholder: 'e.g., 24.3', min: 10, max: 80, step: 0.1, helpText: 'Obesity-related airway inflammation proxy.' },
            { key: 'Smoking', label: 'Smoking Exposure', type: 'select', options: YES_NO_OPTIONS, helpText: 'Current or prior smoke exposure.' },
            { key: 'Wheezing', label: 'Wheezing Episodes', type: 'select', options: YES_NO_OPTIONS, helpText: 'Audible expiratory wheeze presence.' },
            { key: 'ShortnessOfBreath', label: 'Dyspnea (Shortness of Breath)', type: 'select', options: YES_NO_OPTIONS, helpText: 'Self-reported dyspnea symptom.' },
            { key: 'Coughing', label: 'Persistent Cough', type: 'select', options: YES_NO_OPTIONS, helpText: 'Chronic cough symptom indicator.' },
            { key: 'ExerciseInduced', label: 'Exercise-Induced Bronchospasm', type: 'select', options: YES_NO_OPTIONS, helpText: 'Symptoms triggered by activity.' },
        ],
    },
    arthritis: {
        title: 'Arthritis Prediction',
        subtitle: 'Joint pain and mobility signal-based classification.',
        fields: [
            { key: 'Pain_Level', label: 'Joint Pain Intensity', type: 'select', options: SEVERITY_OPTIONS, helpText: 'Clinical severity scale for pain burden.' },
            { key: 'Joint_Mobility', label: 'Functional Joint Mobility Impairment', type: 'select', options: SEVERITY_OPTIONS, helpText: 'Range-of-motion limitation score.' },
            { key: 'Stiffness', label: 'Morning/Activity Stiffness', type: 'select', options: SEVERITY_OPTIONS, helpText: 'Stiffness severity indicator.' },
            { key: 'Swelling', label: 'Articular Swelling', type: 'select', options: SEVERITY_OPTIONS, helpText: 'Observed or reported inflammatory swelling.' },
            { key: 'Age', label: 'Age (years)', type: 'number', placeholder: 'e.g., 60', min: 1, max: 120, helpText: 'Risk increases with age-related degeneration.' },
            { key: 'Gender', label: 'Biological Sex', type: 'select', options: GENDER_OPTIONS, helpText: 'Sex-linked prevalence variation.' },
        ],
    },
    copd: {
        title: 'COPD Prediction',
        subtitle: 'Pulmonary function and respiratory burden estimation.',
        fields: [
            { key: 'Age', label: 'Age (years)', type: 'number', placeholder: 'e.g., 58', min: 1, max: 120, helpText: 'Age-related lung function decline factor.' },
            { key: 'Oxygen_Level', label: 'SpO2, Blood Oxygen Saturation (%)', type: 'number', placeholder: 'e.g., 95', min: 50, max: 100, step: 0.1, helpText: 'Pulse oximetry saturation value.' },
            { key: 'Gender', label: 'Biological Sex', type: 'select', options: GENDER_OPTIONS, helpText: 'Categorical demographic covariate.' },
            {
                key: 'Smoking_History',
                label: 'Smoking History',
                type: 'select',
                helpText: 'Long-term tobacco exposure risk tier.',
                options: [
                    { label: 'Never smoked', value: 'Never smoked' },
                    { label: 'Used to smoke', value: 'Used to smoke' },
                    { label: 'Light smoker', value: 'Light smoker' },
                    { label: 'Heavy smoker', value: 'Heavy smoker' },
                ],
            },
            { key: 'Cough', label: 'Chronic Cough Severity', type: 'select', options: SEVERITY_OPTIONS, helpText: 'Symptom burden scale.' },
            { key: 'Shortness_of_Breath', label: 'Dyspnea Severity', type: 'select', options: SEVERITY_OPTIONS, helpText: 'Breathlessness intensity scale.' },
            { key: 'Fatigue', label: 'Fatigue Burden', type: 'select', options: SEVERITY_OPTIONS, helpText: 'Systemic symptom burden scale.' },
        ],
    },
    liver: {
        title: 'Liver Disease Prediction',
        subtitle: 'Liver enzyme and symptom profile risk prediction.',
        fields: [
            { key: 'Age', label: 'Age (years)', type: 'number', placeholder: 'e.g., 47', min: 1, max: 120, helpText: 'Age-linked hepatic risk progression.' },
            { key: 'BMI', label: 'Body Mass Index (kg/m²)', type: 'number', placeholder: 'e.g., 26.8', min: 10, max: 80, step: 0.1, helpText: 'Metabolic liver risk contributor.' },
            { key: 'ALT', label: 'Alanine Transaminase, ALT (U/L)', type: 'number', placeholder: 'e.g., 42', min: 1, max: 1000, helpText: 'Hepatocellular injury enzyme marker.' },
            { key: 'AST', label: 'Aspartate Transaminase, AST (U/L)', type: 'number', placeholder: 'e.g., 35', min: 1, max: 1000, helpText: 'Liver and tissue injury enzyme marker.' },
            { key: 'Bilirubin', label: 'Total Bilirubin (mg/dL)', type: 'number', placeholder: 'e.g., 1.1', min: 0.1, max: 50, step: 0.1, helpText: 'Bile metabolism marker.' },
            { key: 'Fatigue', label: 'Fatigue Symptom', type: 'select', options: YES_NO_OPTIONS, helpText: 'Constitutional symptom status.' },
            { key: 'Jaundice', label: 'Clinical Jaundice', type: 'select', options: YES_NO_OPTIONS, helpText: 'Visible hyperbilirubinemia sign.' },
            { key: 'Nausea', label: 'Nausea Symptom', type: 'select', options: YES_NO_OPTIONS, helpText: 'GI symptom status.' },
            { key: 'Abdominal_Pain', label: 'Right Upper Quadrant/Abdominal Pain', type: 'select', options: YES_NO_OPTIONS, helpText: 'Hepatobiliary pain symptom status.' },
        ],
    },
};

const COPD_SEVERITY_TO_SCORE: Record<string, number> = {
    No: 0,
    Mild: 1,
    Moderate: 2,
    Severe: 3,
};

function getRiskLevel(probabilityPercent: number): RiskLevel {
    if (probabilityPercent >= 70) {
        return 'high';
    }
    if (probabilityPercent >= 40) {
        return 'moderate';
    }
    return 'low';
}

function getModelLabel(model: ModelType): string {
    const found = MODEL_OPTIONS.find((item) => item.value === model);
    return found ? found.label : model;
}

function toPercent(value: number): number {
    if (value <= 1) {
        return value * 100;
    }
    return value;
}

function getDefaultFormData(model: ModelType): Record<string, FormValue> {
    const defaults: Record<string, FormValue> = {};
    MODEL_CONFIGS[model].fields.forEach((field) => {
        if (field.type === 'select') {
            defaults[field.key] = field.options?.[0]?.value ?? '';
        } else {
            defaults[field.key] = '';
        }
    });
    return defaults;
}

function buildPrefillByModel(model: ModelType, automated: AutomatedMetrics): Record<string, FormValue> {
    switch (model) {
        case 'heart':
            return {
                age: automated.age || '',
                sex: automated.sex === 1 ? 'Male' : 'Female',
                trestbps: automated.resting_bp || '',
                chol: automated.cholesterol || '',
                fbs: automated.fasting_blood_sugar === 1 ? 'True' : 'False',
                thalch: automated.max_heart_rate || '',
            };
        case 'diabetes':
            return {
                age: automated.age || '',
                bmi: automated.bmi || '',
                bloodPressure: automated.resting_bp || '',
            };
        case 'hypertension':
            return {
                Age: automated.age || '',
                Gender: automated.sex === 1 ? 'Male' : 'Female',
                Systolic_BP: automated.resting_bp || '',
                Heart_Rate: automated.max_heart_rate || '',
                BMI: automated.bmi || '',
            };
        case 'ckd':
            return {
                age: automated.age || '',
                bp: automated.resting_bp || '',
                htn: automated.fasting_blood_sugar === 1 ? 'Yes' : 'No',
            };
        case 'asthma':
            return {
                Age: automated.age || '',
                Gender: automated.sex === 1 ? 'Male' : 'Female',
                BMI: automated.bmi || '',
            };
        case 'arthritis':
            return {
                Age: automated.age || '',
                Gender: automated.sex === 1 ? 'Male' : 'Female',
            };
        case 'copd':
            return {
                Age: automated.age || '',
                Gender: automated.sex === 1 ? 'Male' : 'Female',
            };
        case 'liver':
            return {
                Age: automated.age || '',
                BMI: automated.bmi || '',
            };
        default:
            return {};
    }
}

function buildFeaturesPayload(model: ModelType, formData: Record<string, FormValue>): Record<string, FormValue> {
    if (model !== 'copd') {
        return formData;
    }

    const oxygenLevel = Number(formData.Oxygen_Level || 0);
    const coughValue = COPD_SEVERITY_TO_SCORE[String(formData.Cough || 'No')] ?? 0;
    const sobValue = COPD_SEVERITY_TO_SCORE[String(formData.Shortness_of_Breath || 'No')] ?? 0;
    const fatigueValue = COPD_SEVERITY_TO_SCORE[String(formData.Fatigue || 'No')] ?? 0;

    return {
        ...formData,
        Oxygen_Low: oxygenLevel < 92 ? 1 : 0,
        Cough_SOB: coughValue * sobValue,
        Cough_Fatigue: coughValue * fatigueValue,
    };
}

export function Prediction() {
    const [selectedModel, setSelectedModel] = useState<ModelType>('heart');
    const [formData, setFormData] = useState<Record<string, FormValue>>(getDefaultFormData('heart'));
    const [automatedMetrics, setAutomatedMetrics] = useState<AutomatedMetrics>({
        age: 0,
        sex: 0,
        resting_bp: 0,
        cholesterol: 0,
        fasting_blood_sugar: 0,
        max_heart_rate: 0,
        exercise_angina: 0,
        bmi: 0,
    });

    const [result, setResult] = useState<RiskResult | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        void fetchAutomatedMetrics();
    }, []);

    useEffect(() => {
        const defaults = getDefaultFormData(selectedModel);
        const prefill = buildPrefillByModel(selectedModel, automatedMetrics);
        setFormData({ ...defaults, ...prefill });
        setResult(null);
        setErrorMessage('');
    }, [selectedModel, automatedMetrics]);

    const calculateAge = (dobString: string) => {
        if (!dobString) return 0;
        const diffMs = Date.now() - new Date(dobString).getTime();
        const ageDt = new Date(diffMs);
        return Math.abs(ageDt.getUTCFullYear() - 1970);
    };

    const fetchAutomatedMetrics = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const today = new Date().toISOString().split('T')[0];

            // Fetch from Profiles, Daily Intake, and existing Health Metrics
            const [profileRes, intakeRes, metricsRes] = await Promise.all([
                supabase.from('profiles').select('dob').eq('id', user.id).single(),
                supabase.from('daily_intake').select('total_cholesterol').eq('user_id', user.id).eq('date', today).single(),
                supabase.from('health_metrics').select('*').eq('user_id', user.id).single()
            ]);

            const fetchedAge = profileRes.data?.dob ? calculateAge(profileRes.data.dob) : 0;
            const fetchedCholesterol = intakeRes.data?.total_cholesterol || 0;

            const existingMetrics = metricsRes.data || {};

            const mergedMetrics: AutomatedMetrics = {
                age: fetchedAge || existingMetrics.age || 0,
                cholesterol: fetchedCholesterol || existingMetrics.cholesterol || 0,
                sex: existingMetrics.sex || 0,
                resting_bp: existingMetrics.resting_bp || 0,
                fasting_blood_sugar: existingMetrics.fasting_blood_sugar || 0,
                max_heart_rate: existingMetrics.max_heart_rate || 0,
                exercise_angina: existingMetrics.exercise_angina || 0,
                bmi: existingMetrics.bmi || 0,
            };

            setAutomatedMetrics(mergedMetrics);

        } catch (err) {
            console.error('Exception fetching metrics:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (field: string, type: 'number' | 'select') => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const rawValue = e.target.value;
        const parsedValue = type === 'number' ? (rawValue === '' ? '' : Number(rawValue)) : rawValue;
        setFormData((prev) => ({ ...prev, [field]: parsedValue }));
    };

    const getMissingFields = () => {
        return MODEL_CONFIGS[selectedModel].fields.filter((field) => {
            const value = formData[field.key];
            return value === '' || value === null || value === undefined;
        });
    };

    const getOutOfRangeFields = () => {
        return MODEL_CONFIGS[selectedModel].fields.filter((field) => {
            if (field.type !== 'number') {
                return false;
            }

            const raw = formData[field.key];
            if (raw === '' || raw === null || raw === undefined) {
                return false;
            }

            const numeric = Number(raw);
            if (Number.isNaN(numeric)) {
                return true;
            }

            const belowMin = typeof field.min === 'number' && numeric < field.min;
            const aboveMax = typeof field.max === 'number' && numeric > field.max;
            return belowMin || aboveMax;
        });
    };

    const saveBaseMetrics = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return;
            }

            const sexRaw = String(formData.sex || formData.Gender || (automatedMetrics.sex === 1 ? 'Male' : 'Female')).toLowerCase();
            const sexBinary = sexRaw === 'male' || sexRaw === 'm' || sexRaw === '1' ? 1 : 0;

            const row = {
                user_id: user.id,
                age: Number(formData.age || formData.Age || automatedMetrics.age || 0),
                sex: sexBinary,
                resting_bp: Number(formData.trestbps || formData.bp || formData.Systolic_BP || automatedMetrics.resting_bp || 0),
                cholesterol: Number(formData.chol || automatedMetrics.cholesterol || 0),
                fasting_blood_sugar: String(formData.fbs || automatedMetrics.fasting_blood_sugar || 'False').toLowerCase().includes('true') ? 1 : 0,
                max_heart_rate: Number(formData.thalch || formData.Heart_Rate || automatedMetrics.max_heart_rate || 0),
                exercise_angina: automatedMetrics.exercise_angina || 0,
                bmi: Number(formData.bmi || formData.BMI || automatedMetrics.bmi || 0),
                updated_at: new Date().toISOString(),
            };

            await supabase.from('health_metrics').upsert(row);
        } catch (err) {
            console.error('Failed to save metrics:', err);
        }
    };

    const calculateRisk = async () => {
        const missingFields = getMissingFields();
        if (missingFields.length > 0) {
            setErrorMessage(`Please fill all required fields before prediction. Missing: ${missingFields.map((field) => field.label).join(', ')}`);
            return;
        }

        const outOfRangeFields = getOutOfRangeFields();
        if (outOfRangeFields.length > 0) {
            setErrorMessage(`Some values are outside supported clinical ranges. Please review: ${outOfRangeFields.map((field) => field.label).join(', ')}`);
            return;
        }

        setErrorMessage('');
        setIsSaving(true);

        try {
            await saveBaseMetrics();

            const features = buildFeaturesPayload(selectedModel, formData);

            const response = await fetch(`${ML_API_BASE_URL}/predict/disease/${selectedModel}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ features }),
            });

            if (!response.ok) {
                let detail = 'Prediction request failed.';
                try {
                    const errBody = (await response.json()) as { detail?: string };
                    if (errBody?.detail) {
                        detail = errBody.detail;
                    }
                } catch {
                    // No-op: keep generic error message.
                }
                throw new Error(detail);
            }

            const data = (await response.json()) as {
                risk_probability: number;
                prediction: number;
                confidence: number;
            };

            const probabilityPercent = Math.max(0, Math.min(100, toPercent(data.risk_probability)));
            const confidencePercent = Math.max(0, Math.min(100, toPercent(data.confidence)));
            const level = getRiskLevel(probabilityPercent);

            const explanation =
                data.prediction === 1
                    ? `The ${getModelLabel(selectedModel)} model indicates a positive disease-risk signal for the provided health metrics. Please consult a healthcare professional for confirmatory diagnosis and clinical interpretation.`
                    : `The ${getModelLabel(selectedModel)} model indicates a lower disease-risk pattern for the provided health metrics. Maintain preventive lifestyle habits and continue regular medical checkups.`;

            setResult({
                percentage: probabilityPercent,
                confidence: confidencePercent,
                level,
                explanation,
                prediction: data.prediction,
                modelLabel: getModelLabel(selectedModel),
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unable to calculate risk right now.';
            const normalized = message.toLowerCase();
            const isNetworkFailure = normalized.includes('failed to fetch') || normalized.includes('networkerror') || normalized.includes('network request failed');
            setErrorMessage(message);
            if (isNetworkFailure) {
                setErrorMessage('Unable to reach ML backend. Start the ML API server at http://localhost:8000 and try again.');
            }
            setResult(null);
        } finally {
            setIsSaving(false);
        }
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'low':
                return 'text-green-600 bg-green-50 border-green-500';
            case 'moderate':
                return 'text-amber-600 bg-amber-50 border-amber-500';
            case 'high':
                return 'text-red-600 bg-red-50 border-red-500';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-500';
        }
    };

    const getRiskIcon = (level: string) => {
        switch (level) {
            case 'low':
                return <CheckCircle size={48} />;
            case 'moderate':
                return <Activity size={48} />;
            case 'high':
                return <AlertTriangle size={48} />;
            default:
                return <Activity size={48} />;
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen bg-gray-50 justify-center items-center">
                <Activity className="animate-spin text-blue-500" size={48} />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1">
                <Header />
                <main className="p-8">
                    <div className="mb-8 flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">AI Multi-Disease Prediction</h2>
                            <p className="text-gray-600">Choose a model, provide health metrics, and get ML-backed risk prediction with confidence.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <h3 className="text-lg font-semibold text-gray-800">Model and Health Metrics Input</h3>
                                <p className="text-sm text-gray-500">Metrics are pre-filled where possible from your profile and saved records.</p>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Disease Model</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        value={selectedModel}
                                        onChange={(e) => setSelectedModel(e.target.value as ModelType)}
                                    >
                                        {MODEL_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-2">{MODEL_CONFIGS[selectedModel].title}: {MODEL_CONFIGS[selectedModel].subtitle}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {MODEL_CONFIGS[selectedModel].fields.map((field) => {
                                        if (field.type === 'number') {
                                            return (
                                                <Input
                                                    key={field.key}
                                                    label={field.label}
                                                    type="number"
                                                    placeholder={field.placeholder}
                                                    value={formData[field.key]}
                                                    onChange={handleChange(field.key, 'number')}
                                                    min={field.min}
                                                    max={field.max}
                                                    step={field.step}
                                                    helpText={field.helpText}
                                                />
                                            );
                                        }

                                        return (
                                            <div key={field.key}>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                                                <select
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                                    value={String(formData[field.key])}
                                                    onChange={handleChange(field.key, 'select')}
                                                >
                                                    {(field.options || []).map((option) => (
                                                        <option key={`${field.key}-${option.value}`} value={option.value}>{option.label}</option>
                                                    ))}
                                                </select>
                                                {field.helpText && (
                                                    <p className="mt-1 text-xs text-gray-500">{field.helpText}</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {errorMessage && (
                                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                        {errorMessage}
                                    </div>
                                )}

                                <Button onClick={calculateRisk} disabled={isSaving} className="w-full mt-6 flex justify-center items-center gap-2">
                                    <Save size={18} />
                                    {isSaving ? 'Running ML Prediction...' : 'Save & Calculate Risk'}
                                </Button>
                            </CardContent>
                        </Card>

                        {result && (
                            <Card className={`border-2 ${getRiskColor(result.level)}`}>
                                <CardHeader>
                                    <h3 className="text-lg font-semibold text-gray-800">Risk Assessment Result</h3>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center mb-6">
                                        <div className={`inline-flex p-4 rounded-full mb-4 ${getRiskColor(result.level)}`}>
                                            {getRiskIcon(result.level)}
                                        </div>
                                        <div className="text-6xl font-bold mb-2" style={{ color: result.level === 'low' ? '#10b981' : result.level === 'moderate' ? '#d97706' : '#ef4444' }}>
                                            {result.percentage.toFixed(1)}%
                                        </div>
                                        <div className="text-xl font-semibold mb-4 uppercase" style={{ color: result.level === 'low' ? '#10b981' : result.level === 'moderate' ? '#d97706' : '#ef4444' }}>
                                            {result.level} Risk
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl p-6">
                                        <h4 className="font-semibold text-gray-800 mb-3">Model Analysis ({result.modelLabel})</h4>
                                        <p className="text-sm text-gray-700 mb-2">
                                            Predicted Class: <span className="font-semibold">{result.prediction === 1 ? 'At Risk' : 'Lower Risk'}</span>
                                        </p>
                                        <p className="text-sm text-gray-700 mb-4">
                                            Model Confidence (Accuracy Signal): <span className="font-semibold">{result.confidence.toFixed(1)}%</span>
                                        </p>
                                        <p className="text-gray-700 leading-relaxed mb-4">
                                            {result.explanation}
                                        </p>
                                        <div className="space-y-2">
                                            <h5 className="font-semibold text-gray-800">Recommendations:</h5>
                                            <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                                                {result.level === 'high' && <li className="text-red-600 font-medium">Schedule a medical consultation promptly for detailed evaluation.</li>}
                                                {result.level === 'moderate' && <li className="text-amber-700 font-medium">Review modifiable risk factors and repeat evaluation after changes.</li>}
                                                {result.level === 'low' && <li className="text-green-700 font-medium">Continue preventive care and periodic health monitoring.</li>}
                                                <li className="text-gray-600">AI predictions support but do not replace clinical diagnosis.</li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {!result && (
                            <Card className="flex items-center justify-center">
                                <div className="text-center p-8">
                                    <Activity className="text-gray-300 mx-auto mb-4" size={64} />
                                    <p className="text-gray-500">
                                        Select a disease model, verify your health metrics, and click calculate to generate an ML prediction.
                                    </p>
                                </div>
                            </Card>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
