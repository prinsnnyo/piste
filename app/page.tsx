import Link from 'next/link'
import Image from 'next/image'

export default function LandingPage() {
  return (
    <main className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden">
      {/* Background Image */}
      <Image
        src="/landingpageBG.jpg"
        alt="Background"
        fill
        className="object-cover z-0"
        priority
      />

      {/* Content */}
      <div className="relative z-20 max-w-4xl mx-auto text-center">
        {/* Brand Title */}
        <h1 className="text-6xl md:text-7xl font-bold mb-8 brand-gradient-text">
          The Unsaid Thoughts
        </h1>

        {/* Quote */}
        <blockquote className="mb-12 space-y-4">
          <p className="text-2xl md:text-3xl font-light text-[#919191] italic leading-relaxed">
            &ldquo;Sometimes the words we cannot speak aloud
            <br />
            find their voice in the silence of anonymity.&rdquo;
          </p>
          <p className="text-lg muted-text">
            — Unknown
          </p>
        </blockquote>

        {/* Call to Action */}
        <Link
          href="/wall"
          className="inline-block brand-button px-12 py-4 rounded-xl font-semibold text-lg text-white shadow-2xl hover:shadow-[#919191]/20 transition-all duration-300 hover:scale-105"
        >
          Enter the Wall
        </Link>

        {/* Subtitle */}
        <p className="mt-8 muted-text text-sm">
          Share your thoughts anonymously on the map
        </p>
      </div>
    </main>
  )
}
