import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Tables.css";

const Table = () => {
  const BACKEND_URL = "http://localhost:3001";
  const months = [
    { name: "January", number: 1 },
    { name: "February", number: 2 },
    { name: "March", number: 3 },
    { name: "April", number: 4 },
    { name: "May", number: 5 },
    { name: "June", number: 6 },
    { name: "July", number: 7 },
    { name: "August", number: 8 },
    { name: "September", number: 9 },
    { name: "October", number: 10 },
    { name: "November", number: 11 },
    { name: "December", number: 12 },
  ];
  const [search, setSearch] = useState();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [transactions, setTransactions] = useState([]);
  const fetchData = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/transactions`, {
        params: {
          search,
          page,
          perPage,
        },
      });
      console.log(response.data.data);
      setTransactions(response.data.data);
    const total = Math.ceil(response.data.total / perPage);
      setTotalPages(total);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const handleSearch = (e)=>{
    setSearch(e.target.value)
    setPage(1)
  }
  const handlMonth = (e)=>{
    const month = e.target.value
    setSearch(month)
    setPage(1)
  }
  const handlNext = () => {
    console.log(totalPages);
    if (page < totalPages) { setPage((pre) => pre + 1); }
  }
  const handlPre = () => {
    if (page > 1) { setPage((pre) => pre - 1); }
  }
  useEffect(() => {
    fetchData();
  }, [search, page, perPage]);
  return (
    <>
      <div className="submitted-data-main">
        <div className="submitted-instructions">
          <div className="search-box">
            <input type="text" placeholder="Search transaction" onChange={handleSearch}/>
          </div>
          <select onChange={handlMonth}>
            <option>Select Month</option>
            {months.map((month) => (
              <option key={month.number} value={month.number}>{month.name}</option>
            ))}
          </select>
        </div>
        <table>
          <thead>
            <tr>
              <th>
                <span>Id</span>
              </th>
              <th>Title</th>
              <th>Description</th>
              <th>Price</th>
              <th>Category</th>
              <th>Sold</th>
              <th>Image</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, index) => {
              const rowColor = index % 2 === 0 ? "#f0f0f0" : "#ffffff";

              return (
                <tr
                  className="table-data"
                  style={{ backgroundColor: rowColor }}
                  key={index}
                >
                  <td className="item-field texts">{transaction.id}</td>
                  <td className="item-field title-field texts">
                    {transaction.title}
                  </td>
                  <td className="txt-color texts desc-field">
                    {transaction.description}
                  </td>
                  <td className="txt-color texts price-field ">
                    {transaction.price}
                  </td>
                  <td className="txt-color texts category-field">
                    {transaction.category}
                  </td>
                  <td className="txt-color texts sold-field">
                    {transaction.sold ? "Yes" : "No"}
                  </td>
                  <td className="txt-color texts link-field">
                    <a href={transaction.image} target="_blank">
                      {transaction.image.substring(0, 30)}...
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="btns">
          <button style={{backgroundColor: page == 1 && "lightgray"}} onClick={handlPre} disabled={page == 1}>Previous</button>
          <button style={{backgroundColor: page == totalPages && "lightgray"}} onClick={handlNext} disabled={page == totalPages}>Next</button>
        </div>
      </div>
    </>
  );
};

export default Table;