import PassportCard from "@/components/PassportCard";
import { mockSuppliers } from "@/lib/mock";

export default function SupplierPassport() {
  const s = mockSuppliers[0];
  return (
    <div>
      <h1>My Passport</h1>
      <PassportCard s={s} />
    </div>
  );
}
