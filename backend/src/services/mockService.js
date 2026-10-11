const FEATURE_NAMES = [
    'Gender', 'Age', 'Debt', 'Marital Status', 'Bank Customer', 
    'Education Level', 'Ethnicity', 'Years Employed', 'Prior Default', 
    'Employment Status', 'Credit Score', 'Drivers License', 'Citizenship', 
    'Zip Code', 'Income'
];

exports.generatePrediction = (inputData) => {
    const isApproved = Math.random() > 0.4;
    const probability = isApproved ? 0.6 + Math.random() * 0.35 : 0.3 + Math.random() * 0.25;
    
    return {
        prediction: isApproved ? 'approved' : 'rejected',
        probability: Number(probability.toFixed(2)),
        model: inputData.model || 'random_forest',
        isMock: true
    };
};

exports.generateExplanation = (inputData) => {
    const predictionResult = exports.generatePrediction(inputData);
    
    const generateRandomFeatures = () => {
        const features = [];
        const numFeatures = Math.floor(Math.random() * 3) + 6; // 6-8 features
        const shuffledNames = [...FEATURE_NAMES].sort(() => 0.5 - Math.random());
        
        for (let i = 0; i < numFeatures; i++) {
            const featureName = shuffledNames[i];
            const val = Math.random() * 0.3; // 0 to 0.3 contribution
            const direction = Math.random() > 0.5 ? 'positive' : 'negative';
            const actionStr = direction === 'positive' ? 'increased' : 'decreased';
            
            features.push({
                feature: featureName,
                contribution: Number(val.toFixed(3)),
                direction,
                description: `${featureName} ${actionStr} approval chances by ${(val * 100).toFixed(1)}%`
            });
        }
        return features;
    };

    const limeFeatures = generateRandomFeatures();
    const shapFeatures = limeFeatures.map(f => ({
        feature: f.feature,
        shapValue: Number((f.contribution * (f.direction === 'positive' ? 1 : -1)).toFixed(3)),
        description: f.description
    }));

    return {
        ...predictionResult,
        limeExplanation: { features: limeFeatures },
        shapExplanation: { baseValue: 0.5, features: shapFeatures }
    };
};
