function App() {
  const [file, setFile] = React.useState(null);
  const [rules, setRules] = React.useState(["", "", ""]);
  const [results, setResults] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f && f.type === "application/pdf") {
      setFile(f);
      setError("");
    } else {
      setError("Please upload a valid PDF file.");
    }
  };

  async function extractPDF() {
    const fd = new FormData();
    fd.append("pdf", file);

    const res = await fetch("http://localhost:3000/api/extract-pdf", {
      method: "POST",
      body: fd,
    });

    const data = await res.json();
    return data.text;
  }

  async function checkRule(text, rule) {
    const res = await fetch("http://localhost:3000/api/check-rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, rules: [rule] }),
    });

    const data = await res.json();
   if (!data || !data.results || !data.results[0]) {
  return {
    rule,
    status: "fail",
    evidence: "No response from backend",
    reasoning: "Backend returned invalid structure",
    confidence: 0
  };
}
return data.results[0];

  }

  async function checkDocument() {
    if (!file) return setError("Upload a PDF.");
    if (!rules.some((r) => r.trim() !== ""))
      return setError("Enter at least one rule.");

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const text = await extractPDF();
      const output = await Promise.all(
        rules.filter((x) => x.trim()).map((r) => checkRule(text, r))
      );
      setResults(output);
    } catch (e) {
      setError("Something went wrong: " + e.message);
    }

    setLoading(false);
  }

  return (
    <div className="flex justify-center items-center py-12 px-4">
      <div className="w-full max-w-3xl p-8 backdrop-blur-xl bg-white/40 shadow-2xl rounded-3xl border border-white/30">

        {/* Header */}
        <h1 className="text-4xl font-extrabold text-indigo-700 text-center mb-8">
          PDF Compliance Checker
        </h1>

        {/* Upload Section */}
        <div className="mb-8">
          <label className="font-semibold text-lg">1. Upload PDF</label>
          <div className="mt-3 bg-white p-6 border-2 border-dashed rounded-xl text-center cursor-pointer hover:border-indigo-500 transition">
            <input
              type="file"
              accept="application/pdf"
              id="file"
              className="hidden"
              onChange={handleFileChange}
            />
            <label htmlFor="file" className="cursor-pointer text-indigo-600 font-semibold">
              {file ? file.name : "Click here to upload your PDF"}
            </label>
          </div>
        </div>

        {/* Rules */}
        <div className="mb-8">
          <label className="font-semibold text-lg">2. Enter Rules</label>
          <div className="mt-3 space-y-3">
            {rules.map((r, i) => (
              <input
                key={i}
                value={r}
                onChange={(e) => {
                  const arr = [...rules];
                  arr[i] = e.target.value;
                  setRules(arr);
                }}
                placeholder={`Rule ${i + 1}`}
                className="w-full p-3 rounded-lg border-2 border-gray-300 focus:border-indigo-500"
              />
            ))}
          </div>
        </div>

        {/* Button */}
        <button
          onClick={checkDocument}
          disabled={loading}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg transition"
        >
          {loading ? "Analyzing..." : "Check Document"}
        </button>

        {error && (
          <p className="mt-4 p-3 bg-red-200 text-red-800 font-semibold rounded-lg">
            {error}
          </p>
        )}

        {/* Results */}
        {results && (
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-indigo-700 mb-4">
              Analysis Results
            </h2>

            <div className="space-y-4">
              {results.map((r, i) => (
                <div key={i} className="p-5 bg-white rounded-xl shadow border">
                  <p className="font-bold text-lg">
                    Rule: <span className="text-indigo-700">{r.rule}</span>
                  </p>
                  <p>
                    Status:{" "}
                    <span
                      className={
                        r.status === "pass"
                          ? "text-green-600 font-bold"
                          : "text-red-600 font-bold"
                      }
                    >
                      {r.status}
                    </span>
                  </p>
                  <p className="italic text-gray-700 mt-1">
                    Evidence: "{r.evidence}"
                  </p>
                  <p className="text-gray-800 mt-1">{r.reasoning}</p>
                  <p className="font-bold mt-2">
                    Confidence:{" "}
                    <span className="text-indigo-700">{r.confidence}%</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
