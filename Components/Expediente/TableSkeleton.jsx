export default function TableSkeleton () {
  return (
    <table className="dtable">
      <thead>
        <tr>
          <th className="col-check" />
          <th>Folio</th><th>Tipo</th><th>Asunto</th><th>Vehículo</th><th>Entrega</th><th>Estatus</th><th />
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 8 }).map((_, i) => (
          <tr className="skel-row" key={i}>
            <td className="col-check"><div className="skel" style={{ width: 18, height: 18, borderRadius: 5 }} /></td>
            <td><div className="skel skel-bar" style={{ width: 64 }} /></td>
            <td><div className="skel" style={{ width: 78, height: 24, borderRadius: 999 }} /></td>
            <td><div className="skel skel-bar" style={{ width: '70%' }} /></td>
            <td><div className="skel skel-bar" style={{ width: 120 }} /></td>
            <td><div className="skel skel-bar" style={{ width: 90 }} /></td>
            <td><div className="skel" style={{ width: 84, height: 24, borderRadius: 999 }} /></td>
            <td />
          </tr>
        ))}
      </tbody>
    </table>
  )
}
