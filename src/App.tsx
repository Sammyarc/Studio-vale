import { EditorialRail } from "./motion";
import { MenuButton, MobileMenu, Input, Select } from "./ui";
import { useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Plus,
  Minus,
  ShoppingBag,
  Search,
  X,
  Check,
  Truck,
  RotateCcw,
} from "lucide-react";
import {
  DevBadge,
  Modal,
  Newsletter,
  useReveal,
  useStoredState,
  money,
} from "./common";
const products = [
  {
    id: 1,
    name: "The Everyday Blazer",
    category: "Tailoring",
    color: "Warm taupe",
    price: 245,
    image: "/images/blazer.webp",
    tag: "THE NEW UNIFORM",
    description:
      "An easy, oversized silhouette with just enough structure. Cut from a soft wool blend, with a considered shoulder and room to make it your own.",
    fabric: "60% wool, 40% recycled polyester. Fully lined. Dry clean only.",
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: 2,
    name: "The Sunday Shirt",
    category: "Essentials",
    color: "Chalk",
    price: 95,
    image: "/images/shirt.webp",
    tag: "LESS, BUT BETTER",
    description:
      "A relaxed camp collar, a beautifully soft hand feel, and nowhere in particular to be. Your everyday shirt, rethought.",
    fabric: "100% organic cotton. Machine wash cool. Hang to dry.",
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: 3,
    name: "The Wide-Leg Trouser",
    category: "Tailoring",
    color: "Charcoal",
    price: 165,
    image: "/images/trousers.webp",
    tag: "ROOM TO MOVE",
    description:
      "A clean pleat and a generous leg. Designed to sit comfortably at the waist and work just as well with trainers as with something more considered.",
    fabric: "55% wool, 45% recycled polyester. Dry clean only.",
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: 4,
    name: "The Daily Carry",
    category: "Accessories",
    color: "Ink",
    price: 185,
    image: "/images/tote.webp",
    tag: "TAKE IT EVERYWHERE",
    description:
      "Laptop, book, weekend plans. A quietly capable tote in supple pebbled leather, with generous handles and a little structure.",
    fabric:
      "Leather exterior. Cotton lining. Wipe clean with a soft dry cloth.",
    sizes: ["One size"],
  },
];
type Product = (typeof products)[number];
type BagItem = { id: number; size: string; qty: number };
export default function App() {
  useReveal();
  const [category, setCategory] = useState("All pieces");
  const [sort, setSort] = useState("featured");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [size, setSize] = useState("");
  const [bag, setBag] = useStoredState<BagItem[]>("vale-bag", []);
  const [bagOpen, setBagOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [complete, setComplete] = useState(false);
  const [menu, setMenu] = useState(false);
  const [added, setAdded] = useState("");
  const shown = products
    .filter(
      (p) =>
        (category === "All pieces" || p.category === category) &&
        p.name.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "low"
        ? a.price - b.price
        : sort === "high"
          ? b.price - a.price
          : a.id - b.id,
    );
  const count = bag.reduce((sum, item) => sum + item.qty, 0),
    total = bag.reduce(
      (sum, item) =>
        sum + products.find((p) => p.id === item.id)!.price * item.qty,
      0,
    );
  const openProduct = (p: Product) => {
    setProduct(p);
    setSize(p.sizes.length === 1 ? p.sizes[0] : "");
  };
  const add = () => {
    if (!product || !size) return;
    setBag((prev) => {
      const match = prev.find((x) => x.id === product.id && x.size === size);
      return match
        ? prev.map((x) =>
            x === match ? { ...x, qty: Math.min(10, x.qty + 1) } : x,
          )
        : [...prev, { id: product.id, size, qty: 1 }];
    });
    setAdded(`${product.name} added to your bag`);
    setProduct(null);
    setCheckout(false);
    setComplete(false);
    setBagOpen(true);
  };
  const changeQty = (index: number, diff: number) =>
    setBag((prev) =>
      prev
        .map((item, i) =>
          i === index ? { ...item, qty: Math.min(10, item.qty + diff) } : item,
        )
        .filter((item) => item.qty > 0),
    );
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="announcement">
        GOOD THINGS. WORN OFTEN.{" "}
        <span>Complimentary shipping on orders $150+</span>
      </div>
      <header className="vale-nav">
        <a href="#" className="vale-logo">
          STUDIO
          <br />
          VALE<span>®</span>
        </a>
        <nav className="desktop-nav">
          <a href="#shop">Shop the collection</a>
          <a href="#story">Our point of view</a>
          <a href="#newsletter">The good list</a>
        </nav>
        <div className="vale-nav-actions">
          <button
            className="icon-button"
            aria-label="Search collection"
            onClick={() => setSearchOpen(true)}
          >
            <Search size={20} />
          </button>
          <button
            className="bag-button"
            aria-label={`Open shopping bag (${count})`}
            onClick={() => {
              setBagOpen(true);
              setCheckout(false);
              setComplete(false);
            }}
          >
            <ShoppingBag size={19} />
            <span>BAG ({count})</span>
          </button>
          <MenuButton open={menu} onClick={() => setMenu(!menu)} />
        </div>
      </header>
      <MobileMenu open={menu} onClose={() => setMenu(false)} brand="STUDIO VALE" tagline="Good things. Worn often." links={[{"label":"Shop the collection","href":"#shop","description":"Your everyday, elevated"},{"label":"Our point of view","href":"#story","description":"Fewer pieces. More possibilities."},{"label":"The good list","href":"#newsletter","description":"A little inspiration, occasionally"}]} feature={{"image":"/images/blazer.webp","eyebrow":"The new uniform","title":"Meet your next favourite","href":"#shop"}}  />
      <main id="main">
        <section className="fashion-hero">
          <div className="campaign-photo">
            <img
              src="/images/campaign.webp"
              alt="Two models wearing Studio Vale tailoring in a sunlit concrete courtyard"
              fetchPriority="high"
            />
          </div>
          <div className="fashion-hero-copy">
            <p className="eyebrow">COLLECTION 01 — EVERYDAY, ELEVATED</p>
            <h1>
              GOOD THINGS.
              <br />
              <span>WORN OFTEN.</span>
            </h1>
            <p className="hero-intro">Well-made essentials. Easy fits. Good things you'll reach for every day.</p>
            <a href="#shop" className="button">
              Meet your new everyday <ArrowUpRight size={18} />
            </a>
          </div>
          <span className="hero-vertical">LESS NOISE. MORE YOU.</span>
          <div className="campaign-caption">
            <span>THE EVERYDAY EDIT</span>
            <span>01 / 2026</span>
          </div>
          <a href="#shop" className="hero-sticker">
            NOT JUST
            <br />
            FOR A<br />
            <em>season.</em>
            <ArrowUpRight size={26} />
          </a>
        </section>
        <div
          className="fashion-marquee" role="img"
          aria-label="Wear it your way. Make it your everyday."
        >
          <div aria-hidden="true">
            {Array.from({ length: 2 }, (_, group) => (
              <div className="fashion-marquee-group" key={group}>
                {Array.from({ length: 4 }, (_, item) => (
                  <span key={item}>
                    WEAR IT YOUR WAY <i>✳</i> MAKE IT YOUR EVERYDAY <i>✳</i>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        <section id="shop" className="shop-section">
          <div className="shop-heading" data-reveal>
            <div>
              <p className="eyebrow">THE PIECES YOU COME BACK TO</p>
              <h2>ON REPEAT.</h2>
            </div>
            <p>
              Thoughtful fits. Really good fabrics.
              <br />A wardrobe that feels like you.
            </p>
          </div>
          <div className="shop-toolbar">
            <div className="category-tabs" aria-label="Filter collection">
              {["All pieces", "Tailoring", "Essentials", "Accessories"].map(
                (c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={category === c ? "selected" : ""}
                    aria-pressed={category === c}
                  >
                    {c}
                  </button>
                ),
              )}
            </div>
            <div className="sort-select">
              <span className="sr-only">Sort products</span>
              <Select aria-label="Sort products" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="featured">Featured</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
              </Select>
            </div>
          </div>
          {query && (
            <div className="search-result">
              Results for “{query}”{" "}
              <button onClick={() => setQuery("")}>
                Clear search <X size={12} />
              </button>
            </div>
          )}
          <div className="product-grid">
            {shown.map((p) => (
              <article key={p.id} className="product-card">
                <div className="product-image">
                  <button
                    onClick={() => openProduct(p)}
                    aria-label={`View ${p.name}`}
                  >
                    <img
                      src={p.image}
                      loading="lazy"
                      alt={`${p.name} in ${p.color}`}
                    />
                  </button>
                  <span>{p.tag}</span>
                  <button
                    className="quick-add"
                    aria-label={`Choose options for ${p.name}`}
                    onClick={() => openProduct(p)}
                  >
                    <Plus size={19} />
                  </button>
                </div>
                <button
                  className="product-title"
                  onClick={() => openProduct(p)}
                >
                  <h3>{p.name}</h3>
                  <span>{money(p.price)}</span>
                </button>
                <div className="product-color">
                  <i
                    style={{
                      background: ["#99897a", "#e8e1d2", "#595756", "#202020"][
                        p.id - 1
                      ],
                    }}
                  />
                  {p.color}
                </div>
              </article>
            ))}
          </div>
          {shown.length === 0 && (
            <div className="no-products">
              <h3>Nothing here just yet.</h3>
              <p>Try a different piece or start with the full collection.</p>
              <button
                className="button"
                onClick={() => {
                  setQuery("");
                  setCategory("All pieces");
                }}
              >
                See all pieces <ArrowRight size={18} />
              </button>
            </div>
          )}
          <div className="shop-bottom">
            <span aria-live="polite">
              {shown.length} pieces. Endless possibilities.
            </span>
            <a href="#story">
              Behind the collection <ArrowUpRight size={16} />
            </a>
          </div>
        </section>
        <section id="story" className="fashion-story">
          <div className="story-photo">
            <img
              loading="lazy"
              src="/images/campaign.webp"
              alt="The everyday edit: relaxed tailoring in natural tones"
            />
            <span>STUDIO VALE / A WARDROBE TO LIVE IN</span>
          </div>
          <div className="story-copy" data-reveal>
            <p className="eyebrow">OUR POINT OF VIEW</p>
            <h2>
              LESS
              <br />
              BUT
              <br />
              <em>BETTER.</em>
            </h2>
            <p>
              We don't believe getting dressed should be complicated. Just a few
              really good pieces, made to work together. And made to work for
              you.
            </p>
            <p>
              Less chasing the next thing.
              <br />
              More loving what you have.
            </p>
            <a className="text-link" href="#shop">
              Find your favourites <ArrowUpRight size={18} />
            </a>
            <span className="story-asterisk" aria-hidden="true">
              ✳
            </span>
          </div>
        </section>
        <EditorialRail />
        <section className="fashion-promises">
          <article>
            <Truck size={24} />
            <div>
              <h3>GOOD THINGS, DELIVERED.</h3>
              <p>Complimentary shipping on orders $150+.</p>
            </div>
          </article>
          <article>
            <RotateCcw size={24} />
            <div>
              <h3>ROOM TO CHANGE YOUR MIND.</h3>
              <p>A considered 30-day return window.</p>
            </div>
          </article>
          <article>
            <ShoppingBag size={24} />
            <div>
              <h3>BUY LESS. WEAR MORE.</h3>
              <p>Thoughtful essentials, beyond a season.</p>
            </div>
          </article>
        </section>
        <section id="newsletter" className="good-list" data-reveal>
          <div>
            <p className="eyebrow">YOU HAVE GOOD TASTE.</p>
            <h2>
              GET ON
              <br />
              THE GOOD LIST.
            </h2>
          </div>
          <Newsletter label="New pieces. Studio notes. The occasional good thing." />
        </section>
      </main>
      <footer className="vale-footer">
        <svg
          className="footer-huge"
          viewBox="0 0 1000 190"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <text x="4" y="166" textLength="982" lengthAdjust="spacingAndGlyphs">
            STUDIO VALE®
          </text>
        </svg>
        <div className="vale-footer-row">
          <span>© 2026 Studio Vale. Fictional portfolio concept.</span>
          <span>GOOD THINGS. WORN OFTEN.</span>
          <a href="#shop">
            Back to the good stuff <ArrowUpRight size={14} />
          </a>
        </div>
      </footer>
      <Modal
        open={!!product}
        onClose={() => setProduct(null)}
        title="A very good choice"
        wide
      >
        {product && (
          <div className="product-detail">
            <div>
              <img src={product.image} alt={product.name} />
            </div>
            <div className="product-detail-copy">
              <p className="eyebrow">
                {product.category} / {product.color}
              </p>
              <h2>{product.name}</h2>
              <strong className="detail-price">{money(product.price)}</strong>
              <p>{product.description}</p>
              <div className="size-label">
                SIZE <span>{size || "Choose your fit"}</span>
              </div>
              <div className="sizes" aria-label="Choose size">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    className={size === s ? "active" : ""}
                    aria-pressed={size === s}
                    onClick={() => setSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button className="button add-bag" disabled={!size} onClick={add}>
                {size ? "Add to bag" : "Select a size"} <Plus size={18} />
              </button>
              <details>
                <summary>Fabric & care</summary>
                <p>{product.fabric}</p>
              </details>
              <details>
                <summary>Delivery & returns</summary>
                <p>
                  Complimentary shipping on orders $150+. Otherwise $10. Returns
                  within 30 days. This is a fictional store; no products are
                  shipped.
                </p>
              </details>
            </div>
          </div>
        )}
      </Modal>
      <Modal
        open={bagOpen}
        onClose={() => setBagOpen(false)}
        title={`Your bag (${count})`}
      >
        <div className="bag-content">
          {complete ? (
            <div className="form-success" role="status">
              <span className="success-icon">
                <Check />
              </span>
              <h2>GOOD CHOICE.</h2>
              <p>
                Your demo order is complete. No payment was taken and no
                products will be shipped.
              </p>
              <button className="button" onClick={() => setBagOpen(false)}>
                Keep exploring <ArrowRight size={17} />
              </button>
            </div>
          ) : checkout ? (
            <form
              className="request-form"
              onSubmit={(e) => {
                e.preventDefault();
                setComplete(true);
                setBag([]);
              }}
            >
              <h2>MAKE IT YOURS.</h2>
              <p>Demo checkout · no payment details required.</p>
              <div className="field-pair">
                <label>
                  Full name
                  <Input required autoComplete="name" placeholder="Your name" />
                </label>
                <label>
                  Email address
                  <Input
                    required
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </label>
              </div>
              <div className="bag-total">
                <span>Demo order total</span>
                <strong>{money(total + (total < 150 ? 10 : 0))}</strong>
              </div>
              <label className="check-field">
                <Input type="checkbox" required /> I understand this is a demo
                order.
              </label>
              <button className="button">
                Complete demo order <ArrowRight size={17} />
              </button>
              <button
                type="button"
                className="back-bag"
                onClick={() => setCheckout(false)}
              >
                Back to bag
              </button>
              <small>Personal details are not sent or stored.</small>
            </form>
          ) : bag.length === 0 ? (
            <div className="empty-bag">
              <ShoppingBag size={38} />
              <h2>
                ROOM FOR
                <br />
                SOMETHING GOOD.
              </h2>
              <p>Your bag is taking a well-deserved breather.</p>
              <button
                className="button"
                onClick={() => {
                  setBagOpen(false);
                  document.querySelector("#shop")?.scrollIntoView();
                }}
              >
                Explore the collection <ArrowRight size={17} />
              </button>
            </div>
          ) : (
            <>
              <p className="bag-notice">
                {total >= 150
                  ? "Your order qualifies for complimentary shipping."
                  : `${money(150 - total)} away from complimentary shipping.`}
              </p>
              <div className="bag-items">
                {bag.map((item, index) => {
                  const p = products.find((p) => p.id === item.id)!;
                  return (
                    <article key={`${item.id}-${item.size}`}>
                      <img src={p.image} alt={p.name} />
                      <div>
                        <h3>{p.name}</h3>
                        <p>
                          {p.color} / {item.size}
                        </p>
                        <div className="quantity">
                          <button
                            aria-label={`Decrease ${p.name} quantity`}
                            onClick={() => changeQty(index, -1)}
                          >
                            <Minus size={12} />
                          </button>
                          <span>{item.qty}</span>
                          <button
                            disabled={item.qty >= 10}
                            aria-label={`Increase ${p.name} quantity`}
                            onClick={() => changeQty(index, 1)}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <div>
                        <strong>{money(p.price * item.qty)}</strong>
                        <button
                          aria-label={`Remove ${p.name}`}
                          onClick={() =>
                            setBag((prev) => prev.filter((_, i) => i !== index))
                          }
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className="bag-total">
                <span>Subtotal</span>
                <strong>{money(total)}</strong>
              </div>
              <div className="bag-shipping">
                <span>Shipping</span>
                <span>{total >= 150 ? "On us" : money(10)}</span>
              </div>
              <button
                className="button checkout-button"
                onClick={() => setCheckout(true)}
              >
                Continue to demo checkout <ArrowRight size={17} />
              </button>
              <p className="bag-demo">
                Portfolio store · no actual purchases or payments
              </p>
            </>
          )}
        </div>
      </Modal>
      <Modal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        title="Find your everyday"
      >
        <form
          className="search-form"
          onSubmit={(e) => {
            e.preventDefault();
            setCategory("All pieces");
            setSearchOpen(false);
            document.querySelector("#shop")?.scrollIntoView();
          }}
        >
          <h2>
            WHAT'S YOUR
            <br />
            GOOD THING?
          </h2>
          <label htmlFor="product-search" className="sr-only">
            Search products
          </label>
          <Input
            id="product-search"
            placeholder="Try blazer, shirt, trouser…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="button">
            Search the collection <Search size={17} />
          </button>
        </form>
      </Modal>
      <span className="sr-only" role="status">
        {added}
      </span>
      <DevBadge />
    </>
  );
}
