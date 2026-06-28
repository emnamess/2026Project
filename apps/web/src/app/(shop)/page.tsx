import { Hero } from "@/components/home/hero";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { BestSellers } from "@/components/home/best-sellers";
import { CraftStory } from "@/components/home/craft-story";
import { TrustStrip } from "@/components/home/trust-strip";
import { Newsletter } from "@/components/home/newsletter";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedCategories />
      <BestSellers />
      <CraftStory />
      <TrustStrip />
      <Newsletter />
    </>
  );
}
