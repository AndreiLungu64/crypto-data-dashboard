import express, { json } from 'express';
import axios from 'axios';

const app = express();
const port = 3000;
const API_key = "";
const API_Base_URL = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest";

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
let coinMonetaryData = null;
let coinBasicData = null;
let defaultBasicData = null;
let defaultMonetaryData = null;

const fetchDefaultData = async () => {
    try {
      const response = await axios.get(API_Base_URL + "?symbol=BTC", { headers: { 'X-CMC_PRO_API_KEY': API_key } });
      defaultMonetaryData = response.data.data.BTC.quote.USD;
      defaultBasicData = response.data.data.BTC;//schimba la toate unde apare numele monedei cand schimbi default-ul
    } catch (error) {
      console.error("Failed to fetch default data: ", error.message);
    }
  };
  fetchDefaultData();

  let formatData = (cryptoData) => {
    cryptoData = cryptoData.toFixed(2);
    return cryptoData;
  }

  let currencyFormat = (cryptoData) => {
    cryptoData = cryptoData.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2});
    return cryptoData;
  }

  let putSign = (cryptoData) => {
    if (cryptoData[0] !== "-"){
      cryptoData = "+" + cryptoData;
    }
    return cryptoData;
  }

app.get("/", (req,res) => {
    res.render("index.ejs", {
      formatData: formatData,
      putSign: putSign,
      currencyFormat : currencyFormat,
      defaultBasicData: defaultBasicData,
      defaultMonetaryData: defaultMonetaryData,
      coinMonetaryData: coinMonetaryData, 
      coinBasicData: coinBasicData,
      // price: formatData(defaultMonetaryData.price).toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      // volume_24h : defaultMonetaryData.volume_24h.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
    });
});

app.post("/coin", async (req,res) => {
    const selectedCoin = req.body.cryptoButton.toUpperCase();

    try{
    const response = await axios.get(API_Base_URL + "?symbol=" + selectedCoin, { headers: { 'X-CMC_PRO_API_KEY': API_key } });
    coinMonetaryData =response.data.data[selectedCoin].quote.USD;
    coinBasicData = response.data.data[selectedCoin];

    /*the square bracket notation of [selectedCoin] is dynamically evaluating the value of coinSymbol 
    and using it as the property name to access a specific property of the response.data.data object.*/
    res.render("index.ejs" , {
      formatData: formatData,
      putSign: putSign,
      currencyFormat : currencyFormat,
      defaultBasicData: defaultBasicData,
      defaultMonetaryData: defaultMonetaryData,
      coinMonetaryData: coinMonetaryData, 
      coinBasicData: coinBasicData,
    });
    }
    catch(error){
        console.error("Failed to make request: ", error.message);
        res.status(500).send("Failed to fetch activity");
    }
})

app.listen (port, () => {
    console.log(`Server is running on port ${port}`);
    });
