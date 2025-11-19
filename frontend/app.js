function PDFComplianceChecker() {
  const [file, setFile] = React.useState(null);
  const [rules, setRules] = React.useState(['', '', '']);
  const [results, setResults] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError("");
    } else {
      setError("Please upload a valid PDF file");
    }
  };

  async function extractPDFBackend(file) {
    const formData = new FormData();
    formData.append("pdf", file);

    const res = await fetch("http://localhost:3000/api/extract-pdf", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    return data.text;
  }

  async function checkRulesBackend(text, rules) {
    const res = await fetch("http://localhost:3000/api/check-rules", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ text, rules })
    });

    return await res.json();
  }

  const checkDocument = async () => {
    if (!file) return setError("Upload a PDF first");

    const actualRules = rules.filter(r => r.trim() !== "");
    if (actualRules.length === 0) return setError("Enter at least 1 rule");

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const text = await extractPDFBackend(file);
      const data = await checkRulesBackend(text, actualRules);
      setResults(data.results);
    } catch (err) {
      setError("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">PDF Compliance Checker</h1>

      {/* Upload */}
      <div className="mb-6">
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
      </div>

      {/* Rules */}
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Enter Your Rules</h2>
        {rules.map((rule, index) => (
          <input
            key={index}
            className="w-full p-2 mb-2 border rounded"
            placeholder={`Rule ${index + 1}`}
            value={rule}
            onChange={(e) => {
              const updated = [...rules];
              updated[index] = e.target.value;
              setRules(updated);
            }}
          />
        ))}
      </div>

      {/* Button */}
      <button
        onClick={checkDocument}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold"
        disabled={loading}
      >
        {loading ? "Checking..." : "Check Document"}
      </button>

      {/* error */}
      {error && <p className="text-red-600 mt-4">{error}</p>}

      {/* Results */}
      {results && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Results</h2>

          {results.map((r, i) => (
            <div key={i} className="border p-4 rounded mb-2">
              <p><b>Rule:</b> {r.rule}</p>
              <p><b>Status:</b> {r.status}</p>
              <p><b>Evidence:</b> {r.evidence}</p>
              <p><b>Reasoning:</b> {r.reasoning}</p>
              <p><b>Confidence:</b> {r.confidence}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

ReactDOM.render(<PDFComplianceChecker />, document.getElementById("root"));
