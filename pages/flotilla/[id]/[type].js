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

const ALLOWED_TYPES = ["traslado", "flete", "renta"];

export async function getServerSideProps(context) {
  const { id, type } = context.query;
  const clean = (type || "")
    .normalize("NFKC")
    .replace(/[\u200B-\u200F\uFEFF]/g, "")
    .trim()
    .toLowerCase();

  if (!ALLOWED_TYPES.includes(clean)) {
    return { notFound: true };
  }

  return {
    props: {
      id,
      type: clean
    }
  };
}

export default PDFInvoice;
