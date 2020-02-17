const axios = require('axios');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    var flag = false;
    const { symbol, shareAmount } = req.body;
    const user = await User.findOne({ _id: req.user.id });
    const { cash } = user;

    if (!Number.isInteger(shareAmount)) {
      flag = true;
      throw { msg: 'Only whole shares can be bought' };
    }

    const priceCheck = await axios.get(
      `https://cloud.iexapis.com/stable/stock/${symbol}/quote?token=sk_cc1c7f21c56d497db10a82203dc80584&filter=symbol,latestPrice`
    );

    const price = priceCheck.data.latestPrice;
    if (price * shareAmount > cash) {
      flag = true;
      throw { msg: 'Not enough cash to buy that quantity of stocks' };
    }

    const newCashAmount = cash - price * shareAmount;
    user.cash = newCashAmount.toFixed(2);
    user.save();

    next();
  } catch (err) {
    console.error(err.message);
    res.status(404).json(flag ? err : { msg: 'Unknown symbol' });
  }
};
