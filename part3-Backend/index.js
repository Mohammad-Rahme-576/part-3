/*
const express = require("express");
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




require('dotenv').config()
const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const Person = require('./models/person')

const app = express()

app.use(express.static("dist"))
app.use(cors())
app.use(express.json())

morgan.token("body", (req) => JSON.stringify(req.body))
const morganFormat = ':method :url :status :res[content-length] - :response-time ms :body'
app.use(morgan(morganFormat))

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then(persons => {
      response.json(persons)
    })
    .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
  Person.countDocuments({})
    .then(count => {
      response.send(`<p>Phonebook has info for ${count} people</p><p>${new Date()}</p>`)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => {
      console.error('Error in GET /api/persons/:id:', error.message)
      response.status(400).send({ error: 'malformatted id' })
    })
})

app.delete('/api/persons/:id', async (req, res) => {
  try {
    const personId = req.params.id;
    const result = await Person.findByIdAndDelete(personId);
    if (result) {
      res.status(204).end(); 
    } else {
      res.status(404).json({ error: 'Person not found' });
    }
  } catch (error) {
    console.error('Error handler:', error);
    res.status(500).json({ error: 'An unexpected error occurred' });
  }
});

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "name or number missing"
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body;

  Person.findByIdAndUpdate(
    request.params.id, 
    { name, number }, 
    { new: true, runValidators: true, context: 'query' }
  )
  .then(updatedPerson => {
    if (updatedPerson) {
      response.json(updatedPerson);
    } else {
      response.status(404).end();
    }
  })
  .catch(error => {
    console.error('Error in PUT /api/persons/:id:', error.message);
    next(error);
  });
});


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error('Error handler:', error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
  // response.status(500).json({ error: 'An unexpected error occurred' })
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

