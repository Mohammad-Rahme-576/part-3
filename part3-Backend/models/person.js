const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })
//exercise 3.20 part d
const phoneNumberValidator = {
  validator: function (v) {
    return /^\d{2,3}-\d+$/.test(v) && v.length >= 8
  },
  message: props => `${props.value} is not a valid phone number! It should have two parts separated by a hyphen, with the first part having 2-3 digits and the total length being at least 8.`
}

const personSchema = new mongoose.Schema({
  name:{
    type: String,
    minlength: 3,
    required: true
  },
  number: {
    type: String,
    validate: phoneNumberValidator,
    required: true
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)
