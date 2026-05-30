import TailwindDemo from "../components/TailwindDemo";

export default function DemoPage() {
  return (
    <div>
      <h1 style={{ padding: "20px", fontSize: "24px", fontWeight: "bold" }}>
        Demo: Tailwind CSS + shadcn/ui + MUI (Coexistencia)
      </h1>
      <TailwindDemo />
    </div>
  );
}
