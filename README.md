# chrpre

This repository, `chrpre`, houses a collection of Machine Learning models specifically developed for the prediction and analysis of various chronic diseases. It provides modular solutions for risk assessment, leveraging Python-based ML frameworks and tools.

## Table of Contents

-   [Project Title & Description](#project-title--description)
-   [Key Features & Benefits](#key-features--benefits)
-   [Technologies Used](#technologies-used)
-   [Prerequisites & Dependencies](#prerequisites--dependencies)
-   [Installation & Setup Instructions](#installation--setup-instructions)
-   [Project Structure](#project-structure)
-   [Usage Examples](#usage-examples)
-   [Configuration Options](#configuration-options)
-   [Contributing Guidelines](#contributing-guidelines)
-   [License Information](#license-information)
-   [Acknowledgments](#acknowledgments)

## Project Title & Description

**chrpre**

This repository is dedicated to the development and deployment of Machine Learning models for predicting chronic diseases. It currently includes models for Arthritis, Asthma, Chronic Obstructive Pulmonary Disease (COPD), Chronic Kidney Disease (CKD), and Diabetes. The aim is to provide robust predictive tools that can potentially aid in early detection, risk stratification, and patient management.

## Key Features & Benefits

*   **Multi-Disease Prediction:** Specialized ML models for predicting Arthritis, Asthma, COPD, CKD, and Diabetes.
*   **XGBoost Powered:** Utilizes the high-performance XGBoost algorithm for classification tasks, known for its accuracy and efficiency.
*   **Comprehensive Data Preprocessing:** Includes robust pipelines for data cleaning, imputation, scaling, and encoding, ensuring model readiness.
*   **Streamlit Web Application:** Features an interactive web application built with Streamlit for Diabetes risk prediction, offering a user-friendly interface.
*   **Modular & Scalable:** Each disease model is structured independently, allowing for easy expansion, maintenance, and integration.
*   **Pre-trained Artifacts:** Models and preprocessing objects (scalers, encoders, imputers) are saved for direct deployment and inference.

## Technologies Used

### Languages

*   Python
*   JavaScript
*   TypeScript

### Frameworks & Libraries

*   **Python:**
    *   Scikit-learn (Machine Learning)
    *   XGBoost (Gradient Boosting)
    *   Pandas (Data Manipulation)
    *   NumPy (Numerical Operations)
    *   Streamlit (Web Applications)
    *   Joblib (Model Persistence)
*   **Other:**
    *   Node.js (for potential JavaScript/TypeScript tooling or backend)

## Prerequisites & Dependencies

Before you begin, ensure you have met the following requirements:

*   **Python 3.8+**
*   **Node.js** (if you plan to work with any JavaScript/TypeScript parts, though the ML models are primarily Python-based)
*   **Git**

The core Python dependencies are listed below. It is highly recommended to use a virtual environment.

```bash
# Example requirements.txt content
pandas>=1.0.0
numpy>=1.18.0
scikit-learn>=0.23.0
xgboost>=1.0.0
joblib>=0.14.0
streamlit>=0.60.0 # Only required for the Diabetes Streamlit app
```

## Installation & Setup Instructions

To get `chrpre` up and running on your local machine, follow these steps:

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/MSK7705/chrpre.git
    cd chrpre
    ```

2.  **Set up a Python Virtual Environment (Recommended):**

    ```bash
    python -m venv venv
    # On Windows
    .\venv\Scripts\activate
    # On macOS/Linux
    source venv/bin/activate
    ```

3.  **Install Python Dependencies:**
    Create a `requirements.txt` file in the root directory with the dependencies listed in the [Prerequisites](#prerequisites--dependencies) section, then install:

    ```bash
    pip install -r requirements.txt
    ```

    Alternatively, install them manually:

    ```bash
    pip install pandas numpy scikit-learn xgboost joblib streamlit
    ```

4.  **Install Node.js Dependencies (if applicable):**
    If there are specific JavaScript/TypeScript components, navigate to their respective directories and run:

    ```bash
    npm install
    # or
    yarn install
    ```
    (Note: The provided project structure does not explicitly detail a `package.json` or frontend application, so this step might be optional depending on future development.)

## Project Structure

```
.
├── .bolt/                       # Potentially related to Bolt.dev for workflow automation
├── config.json                  # General project configuration file
├── prompt                       # Configuration or data for prompts (e.g., for AI/ML models)
├── .gitignore                   # Specifies intentionally untracked files to ignore
└── ML_Models/                   # Main directory containing all Machine Learning disease models
    ├── Arthritis_ML/
    │   ├── data/
    │   │   ├── arthritis_feedback_highacc.csv
    │   │   ├── encoders_arthritis_highacc.pkl    # Label encoders for categorical features
    │   │   ├── num_imputer_arthritis_highacc.pkl # Numeric imputer for missing values
    │   │   ├── scaler_arthritis_highacc.pkl      # StandardScaler object
    │   │   ├── synthetic_arthritis_highacc.csv   # Synthetic data (if used)
    │   │   └── xgb_arthritis_highacc.pkl         # Trained XGBoost model
    │   └── model.py                              # Script for Arthritis model training and evaluation
    ├── Asthma ML/
    │   ├── asthma_disease_data.csv               # Dataset for Asthma
    │   ├── asthma_feedback.csv
    │   ├── encoders_asthma.pkl                   # Label encoders for categorical features
    │   └── model.py                              # Script for Asthma model training and evaluation
    ├── COPD_ML/
    │   ├── data/
    │   │   # ... (Similar data files as Arthritis_ML)
    │   └── model.py                              # Script for COPD model training and evaluation
    ├── Chronic Kidney disease(CKD) ML/
    │   ├── ckd.csv                               # Dataset for CKD
    │   └── model.py                              # Script for CKD model training and evaluation
    └── Diabetes disease ML/
        ├── ensemble_diabetes_model.pkl           # Trained Diabetes model (ensemble likely)
        ├── diabetes_scaler.pkl                   # StandardScaler object for Diabetes model
        ├── diabetes_label_encoders.pkl           # Label encoders for Diabetes model
        ├── diabetes_imputer.pkl                  # Imputer for Diabetes model
        ├── app.py                                # Streamlit web application for Diabetes prediction
        └── requirements.txt                      # Specific requirements for the Diabetes app (if separated)
```

## Usage Examples

This section provides instructions on how to use the different ML models and applications within the repository.

### 1. Running the Diabetes Risk Prediction Web Application

The Diabetes model includes a user-friendly Streamlit application for interactive risk prediction.

1.  **Navigate to the Diabetes ML directory:**

    ```bash
    cd ML_Models/Diabetes disease ML/
    ```

2.  **Run the Streamlit application:**

    ```bash
    streamlit run app.py
    ```

    This will open the application in your web browser, typically at `http://localhost:8501`.

### 2. Training/Retraining Individual Disease Models

Each `model.py` script within its respective disease directory is designed to handle the training, evaluation, and saving of the ML model and its preprocessing artifacts.

**Example: Training the Arthritis Model**

1.  **Navigate to the Arthritis ML directory:**

    ```bash
    cd ML_Models/Arthritis_ML/
    ```

2.  **Execute the training script:**

    ```bash
    python model.py
    ```

    This script will load the data, preprocess it, train the XGBoost classifier, evaluate its performance, and save the trained model (`xgb_arthritis_highacc.pkl`) along with the scaler, imputer, and encoders in the `data/` subdirectory.

**Follow similar steps for other disease models (Asthma, COPD, CKD) by navigating to their respective directories and running their `model.py` scripts.**

## Configuration Options

*   **`config.json`**: Located in the root directory, this file is likely used for global project configurations. Its specific contents and customizable options would depend on the project's design.
*   **`model.py` scripts**: Within each `model.py` file, you might find variables like `SCRIPT_DIR`, `BASE_FOLDER`, or data paths that can be modified to suit different environments or data locations. For example, `df = pd.read_csv("asthma_disease_data.csv")` can be updated to point to a different dataset path.
*   **Prompt Configuration**: The `prompt` directory might contain configurations or templates for specific interactive or automated prompts within the project, if applicable.

## Contributing Guidelines

We welcome contributions to improve the `chrpre` repository! To contribute, please follow these steps:

1.  **Fork the repository.**
2.  **Create a new branch** for your feature or bug fix: `git checkout -b feature/your-feature-name` or `git checkout -b bugfix/issue-description`.
3.  **Make your changes** and ensure they adhere to the project's coding standards.
4.  **Test your changes** thoroughly.
5.  **Commit your changes** with a clear and descriptive commit message: `git commit -m "feat: Add new feature"`.
6.  **Push your branch** to your forked repository: `git push origin feature/your-feature-name`.
7.  **Open a Pull Request** to the `main` branch of the original repository. Provide a detailed description of your changes and why they are necessary.

## License Information

**License: Not Specified**

As of now, this repository does not have an explicit license specified. Users are advised to contact the repository owner (MSK7705) for clarification on usage, distribution, and modification terms. It is highly recommended to add a standard open-source license (e.g., MIT, Apache 2.0, GPL) to clarify these terms for contributors and users.

## Acknowledgments

*   Thanks to the developers of Python, scikit-learn, XGBoost, pandas, numpy, and Streamlit for providing excellent open-source tools that make projects like this possible.
*   Special thanks to all contributors and users for their support and feedback.
