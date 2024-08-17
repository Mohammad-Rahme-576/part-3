/*const express = require("express");
const morgan = require("morgan")
const cors = require("cors")
const app = express();

app.use(express.static("dist"))
app.use(cors());
app.use(express.json());
// app.use(morgan("tiny"));
//exercise 3.8
morgan.token("body" , (req) => JSON.stringify(req.body));

const morganFormat = ':method :url :status :res[content-length] - :response-time ms :body';

app.use(morgan(morganFormat));

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];
// exercise 3.1
app.get("/api/persons", (request, response) => {
  response.json(persons);
});
// exercise 3.2
app.get("/info", (request, response) => {
  response.send(`<p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date()}</p>`);
});

// exercise 3.3
app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.find((p) => p.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

//exercise 3.4 delete
app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  persons = persons.filter((p) => p.id !== id);
  response.status(204).end();
});

// exercise 3.5
const generatedId = () => {
  const maxId =
    persons.length > 0 ? Math.max(...persons.map((p) => Number(p.id))) : 0;

  return String(maxId + 1);
};

app.post("/api/persons", (request, response) => {
  const body = request.body;
  // exercise 3.6
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "name or number missing",
    });
  } else if (persons.find((p) => p.name === body.name)) {
    return response.status(400).json({
      error: "name must be unique",
    });
  }

  const person = {
    id: generatedId(),
    name: body.name,
    number: body.number,
  };
  persons = persons.concat(person);
  response.json(person);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
*/ 

//here i wil create new version of the code for part c exercises 3.13 and 3.14 so i donot delete the other exercises i solved for the last parts 





const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose'); 
const Person = require('./models/person');

// Connect to MongoDB
const mongoUrl = process.env.MONGODB_URI; 
console.log('connecting to', mongoUrl);

mongoose.connect(mongoUrl)
  .then(() => {
    console.log('connected to MongoDB');
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message);
  });

// Middleware
app.use(express.static('dist'));  // Serve static files from the "dist" directory
app.use(cors());
app.use(express.json());

// Logging middleware
morgan.token('body', (req) => JSON.stringify(req.body));
const morganFormat = ':method :url :status :res[content-length] - :response-time ms :body';
app.use(morgan(morganFormat));

// Logger middleware
const requestLogger = (request, response, next) => {
  console.log('Method:', request.method);
  console.log('Path:  ', request.path);
  console.log('Body:  ', request.body);
  console.log('---');
  next();
};
app.use(requestLogger);

// Routes
app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>');
});

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons);
  });
});

app.get('/info', (request, response) => {
  Person.countDocuments({}).then(count => {
    response.send(`<p>Phonebook has info for ${count} people</p><p>${new Date()}</p>`);
  });
});

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch(error => {
      console.log(error);
      response.status(400).send({ error: 'malformatted id' });
    });
});

app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end();
    })
    .catch(error => {
      console.log(error);
      response.status(400).send({ error: 'malformatted id' });
    });
});

app.post('/api/persons', (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number missing',
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save()
    .then(savedPerson => {
      response.json(savedPerson);
    })
    .catch(error => {
      console.log(error);
      response.status(400).send({ error: 'failed to save person' });
    });
});

// Handle unknown endpoints
app.use((request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
