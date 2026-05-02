const Header = () => (
  <header className="bg-white shadow-sm">
    <nav className="container-custom py-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary-600">CraftersLink</h1>
        <div className="space-x-4">
          <a href="/" className="hover:text-primary-600">Home</a>
          <a href="/artisans" className="hover:text-primary-600">Artisans</a>
          <a href="/login" className="hover:text-primary-600">Login</a>
        </div>
      </div>
    </nav>
  </header>
);
export default Header;
