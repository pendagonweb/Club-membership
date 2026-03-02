import { useState } from "react";
import axios from "axios";

export default function UploadPayment() {
  const [file, setFile] = useState(null);
  const [userId, setUserId] = useState(""); // User _id from MongoDB
  const [uploadedFile, setUploadedFile] = useState("");

  const handleUpload = async () => {
    if (!file || !userId) return alert("Select file and enter User ID");

    const formData = new FormData();
    formData.append("paymentProof", file);

    const res = await axios.post(`http://localhost:5000/api/user/upload-payment/${userId}`, formData);
    if (res.data.success) {
      alert("Payment uploaded!");
      setUploadedFile(res.data.filename || file.name);
    }
  };

  return (
    <div className="p-5 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Upload Payment</h1>
      <input placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} className="border p-2 w-full mb-3"/>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} className="mb-3"/>
      <button onClick={handleUpload} className="bg-green-500 text-white px-4 py-2 rounded">Upload</button>

      {uploadedFile && (
        <div className="mt-3">
          <p>Uploaded File: {uploadedFile}</p>
          <a href={`http://localhost:5000/uploads/${uploadedFile}`} target="_blank" rel="noreferrer" className="text-blue-600">View File</a>
        </div>
      )}
    </div>
  );
}
