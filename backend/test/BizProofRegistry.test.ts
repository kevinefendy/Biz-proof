import { expect } from "chai";
import { ethers } from "hardhat";

describe("BizProofRegistry (PRD §9 — attest/revoke/finance + invoiceHash unik)", () => {
  async function deploy() {
    const [owner, buyer, lender] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("BizProofRegistry");
    const registry = await Factory.deploy();
    await registry.waitForDeployment();
    return { owner, buyer, lender, registry };
  }

  const b32 = (s: string) => ethers.keccak256(ethers.toUtf8Bytes(s));

  it("attest lalu tolak duplikat invoiceHash aktif", async () => {
    const { registry, buyer } = await deploy();
    const invoiceHash = b32("INV/2026/VII/0142|salt-abc");
    const payeeHash = b32("BCA-1234567890|salt-abc");

    const tx = await registry.connect(buyer).attest(b32("supplier-1"), b32("INVOICE_CONFIRMED_V1"), invoiceHash, payeeHash, 0);
    const receipt = await tx.wait();
    expect(receipt?.status).to.equal(1);

    await expect(
      registry.connect(buyer).attest(b32("supplier-1"), b32("INVOICE_CONFIRMED_V1"), invoiceHash, payeeHash, 0)
    ).to.be.revertedWithCustomError(registry, "InvoiceAlreadyAttested");
  });

  it("revoke oleh issuer, lalu markFinanced ditolak untuk revoked", async () => {
    const { registry, buyer, owner } = await deploy();
    const uid = await registry.connect(buyer).attest.staticCall(b32("s"), b32("INVOICE_CONFIRMED_V1"), b32("inv-1"), b32("pay-1"), 0);
    await registry.connect(buyer).attest(b32("s"), b32("INVOICE_CONFIRMED_V1"), b32("inv-1"), b32("pay-1"), 0);
    await registry.connect(buyer).revoke(uid, b32("payee berubah"));
    const att = await registry.getAttestation(uid);
    expect(att.status).to.equal(2); // Revoked
    await expect(registry.connect(owner).markFinanced(uid)).to.be.revertedWithCustomError(registry, "InvalidStatusTransition");
  });

  it("markFinanced hanya lender terotorisasi/owner", async () => {
    const { registry, buyer, lender, owner } = await deploy();
    const uid = await registry.connect(buyer).attest.staticCall(b32("s"), b32("INVOICE_CONFIRMED_V1"), b32("inv-2"), b32("pay-2"), 0);
    await registry.connect(buyer).attest(b32("s"), b32("INVOICE_CONFIRMED_V1"), b32("inv-2"), b32("pay-2"), 0);
    await expect(registry.connect(lender).markFinanced(uid)).to.be.revertedWithCustomError(registry, "NotAuthorized");
    await registry.connect(owner).setLenderAuthorization(lender.address, true);
    await registry.connect(lender).markFinanced(uid);
    const att = await registry.getAttestation(uid);
    expect(att.status).to.equal(3); // Financed
  });
});
