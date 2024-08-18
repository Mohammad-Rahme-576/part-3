//exercise b(2.6 => 2.10) c( => 2.11) d(=>2.15) e(=>2.17)

import { useState, useEffect } from "react";
import personServices from "../services/persons";
import './index.css';

const Notification = ({ message, errorMessage }) => {
  if (message === null && errorMessage === null) {
    return null;
  }
  return (
    <div className={errorMessage ? "error" : "success"}>
      {errorMessage || message}
    </div>
  );
};


const Filter = (props) => {
  return (
    <div>
      filter shown with :
      <input value={props.newSearch} onChange={props.handleSearchChange} />
    </div>
  );
};

const PersonForm = ({
  newName,
  newNumber,
  handleNameChange,
  handleNumberChange,
  addNameNumber,
}) => {
  return (
    <div>
      <form onSubmit={addNameNumber}>
        <div>
          name: <input value={newName} onChange={handleNameChange} />
        </div>
        <div>
          number: <input value={newNumber} onChange={handleNumberChange} />
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>
    </div>
  );
};

const Persons = (props) => {
  return (
    <div>
      {props.personsToShow.map((person) => (
        <p key={person.id}>
          {person.name} {person.number} <button onClick={() => props.deletePerson(person.id)}>delete</button>
        </p>
      ))}
    </div>
  );
};

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [newSearch, setNewSearch] = useState("");
  const[message,setMessage]=useState(null);
  const[errorMessage,setErrorMessage]=useState(null);


  useEffect(() => {
    personServices.getAll()
      .then((data) => {
        setPersons(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Error fetching persons:", error);
        setPersons([]); 
      });
  }, []);
  
  const addNameNumber = (event) => {
    event.preventDefault();
    const nameObject = {
      name: newName,
      number: newNumber,
    };
  
    if (persons.find((person) => person.name === newName)) {
      alert(`${newName} is already added to phonebook. Replace the old number with the new one?`);
      const person = persons.find((person) => person.name === newName);
      personServices.update(person.id, nameObject)
        .then((response) => {
          setPersons(persons.map((person) => (person.id === response.id ? response : person)));
          setNewName("");
          setNewNumber("");
          setMessage(`Updated ${newName}`);
          setTimeout(() => setMessage(null), 3000);
        })
        .catch((error) => {
          setErrorMessage(error.response?.data?.error || `Error updating ${person.name}`);
          setTimeout(() => setErrorMessage(null), 3000);
          console.error("Error updating person:", error);
        });
    } else {
      personServices.create(nameObject)
        .then((newPerson) => {
          setPersons(persons.concat(newPerson));
          setNewName("");
          setNewNumber("");
          setMessage(`Added ${newName}`);
          setTimeout(() => setMessage(null), 3000);
        })
        .catch((error) => {
          setErrorMessage(error.response?.data?.error || `Error adding ${newName}`);
          setTimeout(() => setErrorMessage(null), 3000);
          console.error("Error creating person:", error);
        });
    }
  };
  

  const deletePerson = (id) => {
    const person = persons.find((person) => person.id === id);
    if (window.confirm(`Delete ${person.name}?`)) {
      personServices
        .deleteP(id)
        .then(() => {
          setPersons(persons.filter((person) => person.id !== id));
        })
        .catch((error) => {
          setErrorMessage(`Information of ${person.name} has already been removed from server`)
          setTimeout(()=>{setErrorMessage(null)},3000)
          console.error("Error deleting person:", error);
        });
    }
  }
  const handleNameChange = (event) => {
    console.log(event.target.value);
    setNewName(event.target.value);
  };
  const handleNumberChange = (event) => {
    console.log(event.target.value);
    setNewNumber(event.target.value);
  };

  const handleSearchChange = (event) => {
    console.log(event.target.value);
    setNewSearch(event.target.value);
  };

  const personsToShow = persons.filter((person) =>
    person.name.toLowerCase().includes(newSearch.toLowerCase())
  );

  return (
    <div  className="container">
      <h2>Phonebook</h2>
      <Notification message={message} errorMessage={errorMessage} />
      <Filter newSearch={newSearch} handleSearchChange={handleSearchChange} />

      <h1>add new </h1>
      <PersonForm
        newName={newName}
        newNumber={newNumber}
        handleNameChange={handleNameChange}
        handleNumberChange={handleNumberChange}
        addNameNumber={addNameNumber}
      />
      <h2>Numbers</h2>
      <Persons personsToShow={personsToShow}  deletePerson={deletePerson}/>
    </div>
  );
};

export default App;
