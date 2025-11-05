interface SpecsTableProps {
  listing: Record<string, any>;
}

const SPEC_FIELDS: { key: string; label: string }[] = [
  { key: 'make', label: 'Make' },
  { key: 'model', label: 'Model' },
  { key: 'year', label: 'Year' },
  { key: 'mileageKm', label: 'Mileage (km)' },
  { key: 'bodyType', label: 'Body type' },
  { key: 'fuelType', label: 'Fuel' },
  { key: 'transmission', label: 'Transmission' },
  { key: 'drivetrain', label: 'Drivetrain' },
  { key: 'engineSizeL', label: 'Engine (L)' },
  { key: 'powerHp', label: 'Power (hp)' },
  { key: 'ownersCount', label: 'Owners' },
  { key: 'serviceHistory', label: 'Service history' },
  { key: 'accidentHistory', label: 'Accident history' }
];

export const SpecsTable = ({ listing }: SpecsTableProps) => (
  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
    <table className="min-w-full divide-y divide-slate-200 text-sm">
      <tbody>
        {SPEC_FIELDS.filter((field) => listing[field.key] !== null && listing[field.key] !== undefined)
          .map((field) => (
            <tr key={field.key} className="odd:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-600">{field.label}</td>
              <td className="px-4 py-3 text-slate-900">
                {typeof listing[field.key] === 'number'
                  ? listing[field.key].toLocaleString()
                  : String(listing[field.key])}
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  </div>
);
