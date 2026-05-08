const PhoneModel = require('../../models/PhoneModel');

exports.getPhoneModels = async (req, res) => {
  try {
    const { brand } = req.query;
    const query = brand ? { brand: new RegExp(brand, 'i') } : {};
    
    const models = await PhoneModel.find(query).sort({ popularity: -1 });
    
    res.json({
      success: true,
      count: models.length,
      data: models
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPhoneModelByDetails = async (req, res) => {
  try {
    const { brand, model } = req.query;
    if (!brand || !model) {
      return res.status(400).json({ message: 'Brand and model are required' });
    }
    
    const phone = await PhoneModel.findOne({ 
      brand: new RegExp(`^${brand}$`, 'i'), 
      model: new RegExp(`^${model}$`, 'i') 
    });
    
    if (!phone) {
      return res.status(404).json({ message: 'Model not found' });
    }
    
    res.json({
      success: true,
      data: phone
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
