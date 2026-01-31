import Link from 'next/link';
import { ArrowRightIcon, ShieldCheckIcon, FingerPrintIcon, KeyIcon } from '@heroicons/react/24/outline';

export default function Home() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Decentralized Identity with
          <span className="text-primary-600"> Zero-Knowledge </span>
          Access Control
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Privacy-preserving identity management on blockchain. Prove attributes without revealing data
          using zero-knowledge proofs.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/did/create" className="btn-primary flex items-center gap-2">
            Create Your DID
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
          <Link href="/credentials" className="btn-secondary">
            Explore Credentials
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="card text-center">
          <div className="flex justify-center mb-4">
            <FingerPrintIcon className="w-12 h-12 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Decentralized Identity</h3>
          <p className="text-gray-600">
            Create and manage your decentralized identifier (DID) on the blockchain.
            Full control over your digital identity.
          </p>
        </div>

        <div className="card text-center">
          <div className="flex justify-center mb-4">
            <ShieldCheckIcon className="w-12 h-12 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Zero-Knowledge Proofs</h3>
          <p className="text-gray-600">
            Prove attributes like age or credentials without revealing underlying data.
            Privacy by design.
          </p>
        </div>

        <div className="card text-center">
          <div className="flex justify-center mb-4">
            <KeyIcon className="w-12 h-12 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Access Control</h3>
          <p className="text-gray-600">
            Grant access to resources based on verified credentials without exposing
            sensitive information.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="card">
        <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-1">Create Your DID</h4>
              <p className="text-gray-600">
                Connect your wallet and create a decentralized identifier stored on the blockchain.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-1">Receive Credentials</h4>
              <p className="text-gray-600">
                Get verifiable credentials from trusted issuers. Credentials are cryptographically signed
                and stored securely.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-1">Generate ZK Proofs</h4>
              <p className="text-gray-600">
                Create zero-knowledge proofs to verify attributes without revealing actual data.
                Prove you're over 18 without sharing your birthdate.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
              4
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-1">Access Resources</h4>
              <p className="text-gray-600">
                Use your ZK proofs to gain access to resources and services while maintaining privacy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-8">Use Cases</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h4 className="font-semibold text-lg mb-2">Age Verification</h4>
            <p className="text-gray-600">
              Prove you meet age requirements for services without revealing your exact birthdate.
            </p>
          </div>

          <div className="card">
            <h4 className="font-semibold text-lg mb-2">Credential Verification</h4>
            <p className="text-gray-600">
              Verify educational or professional credentials without exposing all details.
            </p>
          </div>

          <div className="card">
            <h4 className="font-semibold text-lg mb-2">Membership Proof</h4>
            <p className="text-gray-600">
              Prove membership in organizations or groups while remaining pseudonymous.
            </p>
          </div>

          <div className="card">
            <h4 className="font-semibold text-lg mb-2">Access Control</h4>
            <p className="text-gray-600">
              Grant access to digital resources based on verified attributes without identity disclosure.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="card text-center bg-primary-50 border-primary-200">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Create your decentralized identity and start using zero-knowledge proofs for
          privacy-preserving authentication and access control.
        </p>
        <Link href="/did/create" className="btn-primary inline-flex items-center gap-2">
          Create Your DID Now
          <ArrowRightIcon className="w-5 h-5" />
        </Link>
      </section>
    </div>
  );
}
