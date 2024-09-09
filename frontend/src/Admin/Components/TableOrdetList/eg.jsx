import React, { useState } from 'react';

const initialData = [
  { id: 1, name: '', age: '',type: '' },
  
];

const Eg = () => {
  const [data, setData] = useState(initialData);

  const handleChange = (e, index, field) => {
    const newData = [...data];
    newData[index][field] = e.target.value;
    setData(newData);
  };

  const handleAddRow = () => {
    setData([...data, { id: data.length + 1, name: '', age: '',type:'' }]);
  };

  const handleRemoveRow = (index) => {
    const newData = data.filter((_, i) => i !== index);
    setData(newData);
  };

  return (
    <div>
      <button onClick={handleAddRow}>Add Row</button>
      <table border="1">
        <thead>
          <tr>
            <th>Food Name</th>
            <th>Quantity</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={row.id}>
              <td>
                <input
                  type="text"
                  value={row.name}
                  onChange={(e) => handleChange(e, index, 'name')}
                />
              </td>
              <td>
                <input
                  type="text"
                  value={row.age}
                  onChange={(e) => handleChange(e, index, 'age')}
                />
              </td>
              <td>
              <select
                  id="type"
                  name="type"
                  value={row.type}
                  onChange={(e) => handleChange(e.target.value)}
                  required
                >
                  <option value="">Select a type</option>
                  <option value="Veg">Veg</option>
                  <option value="Non Veg">Non Veg</option>
                </select>
              </td>
              <td>
                <button onClick={() => handleRemoveRow(index)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Eg;