import React from "react";
import {Link} from "react-router-dom"
import "./Navbar.css"
const Navbar = () => {
  return (
    <nav>
      <div className="brand-name">
        <h1>Roxiler Systems</h1>
      </div>
      <ul className="options">
        <li>
          <Link to={''}>Tables</Link>
        </li>
        <li>
          <Link to='/statistics'>Statistics</Link>
        </li>
        <li>
          <Link to='/pie-chart'>Pie Chart</Link>
        </li>
        <li>
          <Link to='bar-chart'>Bar Chart</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
