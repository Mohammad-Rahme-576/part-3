const mongoose = require("mongoose");


if(process.argv.length < 3){
    console.log('give password as argument ');
    process.exit(1);
}

const password = process.argv[2]

const url = 
`mongodb+srv://mohammadrahme74:${password}@cluster0.0cua0.mongodb.net/phoneApp?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set("strictQuery", false);

mongoose.connect(url);

const personSchema = new mongoose.Schema({
    name : String,
    number : Number,
})

const Person = mongoose.model("Person", personSchema);

const person = new Person({
    name : 'mongodb try',
    number : 12345678,
})


person.save().then(result => {
    console.log('person saved!');
    mongoose.connection.close();
})