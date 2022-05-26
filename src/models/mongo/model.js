const {userSchema} = require("./schema.js")
const mongoose = require("mongoose")
const UserModel = mongoose.model('User', userSchema);
UserModel.createCollection().then(function(collection) {
    console.log('Collection is created!');
  });

class MongoOperations{
    async createUser(data){
        try {
            const user = await UserModel.create({username: data.username, password: data.password})
            return user
        } catch (error) {
            return error
        }
    }

    async getUser(username){
        try {
            const user = await UserModel.findOne({username: username})
            return user
        } catch (error) {
            return error
        }
    }

    async login(data){
        try {
            
        } catch (error) {
            return error
        }
    }
}

module.exports = new MongoOperations()