import { useState, useEffect } from "react";
const API = process.env.NEXT_PUBLIC_API;

const PDFInvoice = ({ id, type }) => {
  const [pdfurl, setPdfurl] = useState("");
  const [loading, setLoading] = useState(false);

  const getPDFURL = async () => {
    setLoading(true);
    await fetch(`${API}/flotilla/plan/print/${id}?type=${type}`, {
      headers: { "Content-Type": "application/json" },
      method: "POST",
    }).then((res) => {
      res
        .arrayBuffer()
        .then((buffer) => {
          const blob = new Blob([buffer], { type: "application/pdf" });
          const URLpreview = URL.createObjectURL(blob);
          setPdfurl(URLpreview);
        })
        .finally(() => setLoading(false));
    });
  };

  useEffect(() => {
    getPDFURL();

    return () => {
      setPdfurl("");
    };
  }, []);

  return (
    <>
      <header className="bg-[#3f51b5] text-white px-4 py-3">
        <h1 className="text-lg font-bold">Documento PDF</h1>
      </header>
      <div className="w-full">
        {loading && <h5 className="text-xl font-medium p-4">Cargando...</h5>}
        {!loading && (
          <iframe
            src={pdfurl}
            width="100%"
            height="1200px"
            title="PDF Preview"
            frameBorder="0"
            allowFullScreen
          />
        )}
      </div>
    </>
  );
};

export async function getServerSideProps(context) {
  const { id, type } = context.query;

  return {
    props: {
      id,
      type: type?.trim().toLowerCase() || 'traslado'
    }
  };
}

export default PDFInvoice;
