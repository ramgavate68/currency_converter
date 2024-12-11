import React, { useState, useEffect } from "react";
import { digitToWordsConverter } from "digits-words-currency_converter";
import { countryCurrencyData } from "./common/commondata";

const App = () => {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedTargetCountry, setSelectedTargetCountry] = useState("");
  const [amount, setAmount] = useState("");
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [ogToWords, setOgToWords] = useState(null);
  const [tgToWords, setTgToWords] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const countryList = countryCurrencyData.map((country) => ({
    name: country.countryName,
    currency: country.currency,
    code: country.currencyCode,
  }));

  useEffect(() => {
    setCountries(countryList);
  }, [countryList]);

  useEffect(() => {
    if (amount && selectedCountry) {
      setOgToWords(digitToWordsConverter(amount, selectedCountry));
    }
  }, [amount, selectedCountry]);

  useEffect(() => {
    if (convertedAmount && selectedTargetCountry) {
      setTgToWords(
        digitToWordsConverter(convertedAmount, selectedTargetCountry)
      );
    }
  }, [convertedAmount, selectedTargetCountry, selectedCountry]);

  const handleCountryChange = (event) => {
    setSelectedCountry(event.target.value);
  };

  const handleTargetCountryChange = (event) => {
    setSelectedTargetCountry(event.target.value);
  };

  const handleAmountChange = (event) => {
    const value = event.target.value;
    if (!isNaN(value) || value === "") {
      setAmount(value);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedCountry || !selectedTargetCountry || !amount) {
      setError("Please select both countries and enter an amount.");
      return;
    }

    setError(null);
    setIsLoading(true);

    const selectedCountryObj = countries.find(
      (country) => country.name === selectedCountry
    );
    const selectedTargetCountryObj = countries.find(
      (country) => country.name === selectedTargetCountry
    );

    if (!selectedCountryObj || !selectedTargetCountryObj) {
      setError("Invalid country selected.");
      setIsLoading(false);
      return;
    }

    if (selectedCountryObj === selectedTargetCountryObj) {
      setError("Select different currencies.");
      setIsLoading(false);
      return;
    }

    const selectedCountryCurrency = selectedCountryObj.code;
    const selectedTargetCountryCurrency = selectedTargetCountryObj.code;

    if (selectedCountryCurrency === selectedTargetCountryCurrency) {
      setConvertedAmount(amount);
      setIsLoading(false);
      return;
    }

    try {
      const apiKey =
        process.env.REACT_APP_API_KEY || "a8be6d6f7b0a8b12cd0951bd";

      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${selectedCountryCurrency}`
      );

      const data = await response.json();

      if (data.result === "success") {
        const exchangeRate =
          data.conversion_rates[selectedTargetCountryCurrency];
        if (exchangeRate) {
          const convertedValue = (amount * exchangeRate).toFixed(2);
          setConvertedAmount(convertedValue);
        } else {
          setError("Unable to get exchange rate.");
        }
      } else {
        setError("Unable to get exchange rate.");
      }
    } catch (err) {
      setError("Error fetching exchange rate data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwapCountries = () => {
    setSelectedCountry(selectedTargetCountry);
    setSelectedTargetCountry(selectedCountry);

    if (selectedCountry && selectedTargetCountry && amount && !isNaN(amount)) {
      handleSubmit({
        preventDefault: () => {},
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h5 className="text-center text-white p-2 pt-4 text-lg font-bold tracking-tight bg-gray-500 text-gray-900">
          Convert currency To Any Country And Get It In Words!
        </h5>
      </header>

      <main className="flex-grow">
        <div className="flex min-h-full flex-col justify-center px-2 py-3 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <h2 className="mt-0 text-center text-xl font-bold tracking-tight text-gray-900">
              Select Countries and Amount
            </h2>
          </div>

          <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="country1"
                  className="block text-sm font-bold text-gray-900"
                >
                  Select Country
                </label>
                <div className="mt-2">
                  <select
                    id="country1"
                    name="country1"
                    value={selectedCountry}
                    onChange={handleCountryChange}
                    required
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                  >
                    <option value="">Select a country</option>
                    {countries.map((country, index) => (
                      <option key={index} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-bold text-gray-900"
                >
                  Amount
                </label>
                <div className="mt-2">
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={amount}
                    onChange={handleAmountChange}
                    required
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                    placeholder="Enter amount"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {ogToWords && (
                <div className="mt-6 text-center text-white p-2 border rounded-lg">
                  <h3 className="text-sm-50 font-medium text-gray-900">
                    Amount in words (Original)
                  </h3>
                  <p className="text-lg font-bold text-gray-900 italic">
                    {ogToWords}
                  </p>
                </div>
              )}

              <div className="flex justify-center m-1">
                <button
                  type="button"
                  onClick={handleSwapCountries}
                  className="flex justify-center items-center rounded-md bg-white-900 px-0 py-0 text-sm font-semibold text-white shadow-xl hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                >
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/7166/7166841.png"
                    alt="sync icon"
                    className="w-15 h-12 p-0 m-0"
                  />
                </button>
              </div>

              <div>
                <label
                  htmlFor="country2"
                  className="block text-sm font-bold text-gray-900"
                >
                  Target Country
                </label>
                <div className="mt-2">
                  <select
                    id="country2"
                    name="country2"
                    value={selectedTargetCountry}
                    onChange={handleTargetCountryChange}
                    required
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                  >
                    <option value="">Select a target country</option>
                    {countries.map((country, index) => (
                      <option key={index} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  className="flex justify-center items-center rounded-md bg-white-900 px-0 py-0 m-0 text-sm font-semibold text-white shadow-xl hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                >
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/5266/5266493.png"
                    alt="sync icon"
                    className="w-15 h-12 p-0 m-0"
                  />
                </button>
              </div>

              {isLoading && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
                  <div
                    className="w-16 h-16 border-5 rounded-full animate-spin"
                    style={{
                      borderImage:
                        "linear-gradient(to right, #f87171, #fbbf24, #3b82f6) 1",
                      borderStyle: "solid",
                      borderWidth: "5px",
                    }}
                  ></div>
                </div>
              )}
            </form>

            {convertedAmount && tgToWords && (
              <div className="border rounded-xl m-4 border-gray-900 shadow-xl">
                <div className="text-center mt-4">
                  <h2 className="font-bold text-sm-50 underline tracking-tight text-gray-900">
                    {selectedCountry} to {selectedTargetCountry}
                  </h2>
                  <p className="font-medium text-lg text-gray-900 border p-0 bg-gray-900 text-white border-gray-800 border-rounded">
                    {convertedAmount}{"   "}
                    <span className="font-bold text-white-700">
                      {selectedTargetCountry}
                    </span>
                  </p>
                  <p className="text-lg font-bold text-gray-900 italic">
                    {tgToWords}{" "}
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 text-center text-red-500">
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto text-center">
          <p className="text-lg">Built with ❤️ using React By Ram.....!</p>
          <p className="text-sm">
            © {new Date().getFullYear()} Currency Converter App.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
