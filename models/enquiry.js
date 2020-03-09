var mongoose = require("mongoose");

var EnquirySchema = new mongoose.Schema({
    name: "string",
    description: "string",
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});

module.exports = mongoose.model("Enquiry", EnquirySchema);