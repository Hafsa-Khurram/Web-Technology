import "../Assets/css/Blog.css";
import image1 from "../Assets/images/1.jpg";
import image2 from "../Assets/images/2.jpg";
import image3 from "../Assets/images/3.jpg";
import image4 from "../Assets/images/4.jpg";
import image5 from "../Assets/images/5.jpg";
import image6 from "../Assets/images/6.jpg";
import paris from "../Assets/images/5.jpg";
import tokyo from "../Assets/images/6.jpg";
import sydney from "../Assets/images/7.jpg";
import capeTown from "../Assets/images/8.jpg";
import NavBar from "./NavBar";

function Blog() {
  const blogPosts = [
    {
      image: image1,
      title: "Top 10 Places to Visit in 2024",
      description:
        "From hidden gems to iconic landmarks, discover the best places.",
    },
    {
      image: image2,
      title: "Luxury Resorts for Your Dream Vacation",
      description:
        "Relax and unwind in the most luxurious resorts across the globe.",
    },
    {
      image: image3,
      title: "How to Travel on a Budget",
      description:
        "Learn how to save money while exploring the world and making the most of your travel adventures.",
    },
    {
      image: image4,
      title: "The Ultimate Guide to Solo Travel",
      description:
        "Discover the joys and challenges of solo travel and tips to make your journey unforgettable.",
    },
    {
      image: image5,
      title: "Explore Hidden Beaches Around the World",
      description:
        "Discover remote and untouched beaches perfect for a relaxing getaway.",
    },
    {
      image: image6,
      title: "Ultimate Guide to Adventure Travel",
      description:
        "From hiking to diving, find out the best destinations for adrenaline-packed adventures.",
    },
  ];

  // Popular destinations data
  const destinations = [
    { image: paris, name: "Paris, France" },
    { image: tokyo, name: "Tokyo, Japan" },
    { image: sydney, name: "Sydney, Australia" },
    { image: capeTown, name: "Cape Town, South Africa" },
  ];

  return (
    <>
      <NavBar />
      <div className="blog-container">
        <header className="blog-header">
          <div className="blog-section-container">
            <div className="blog-header-content">
              <h1 className="blog-header-title">GoTravel Blog</h1>
              <p className="blog-header-description">
                Unveil the best travel experiences, tips, and hidden gems around
                the world!
              </p>
              <button className="blog-header-button">Explore More</button>
            </div>
          </div>
        </header>

        {/* Blog Section */}
        <section className="blog-blog-container">
          <h2 className="blog-section-title">Latest Blog Posts</h2>
          <div className="blog-blog-grid">
            {blogPosts.map((post, index) => (
              <div key={index} className="blog-blog-card">
                <img
                  src={post.image}
                  alt={post.title}
                  className="blog-card-image"
                />
                <div className="blog-blog-content">
                  <h3 className="blog-blog-title">{post.title}</h3>
                  <p className="blog-blog-description">{post.description}</p>
                  <button className="blog-blog-button">Read More</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Destinations Section */}
        <section className="destinations-container">
          <div className="destinations-section-container">
            <h2 className="destinations-section-title">Popular Destinations</h2>
            <div className="destinations-destinations-grid">
              {destinations.map((destination, index) => (
                <div key={index} className="destinations-destination-card">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="destination-image"
                  />
                  <div className="destinations-destination-name">
                    {destination.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer Section */}
        <footer className="footer">
          <div className="footer-section-container">
            <h4 className="footer-title">GoTravel</h4>
            <div className="footer-social-icons">
              <span className="footer-icon">
                <i className="ri-facebook-fill"></i>
              </span>
              <span className="footer-icon">
                <i className="ri-twitter-fill"></i>
              </span>
              <span className="footer-icon">
                <i className="ri-instagram-line"></i>
              </span>
              <span className="footer-icon">
                <i className="ri-linkedin-fill"></i>
              </span>
            </div>
            <p className="footer-description">
              Explore the world with GoTravel. The journey of a lifetime awaits
              you.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

export default Blog;
