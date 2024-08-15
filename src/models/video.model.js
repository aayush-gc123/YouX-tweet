import mongoose , {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoSchema = new Schema({
  videoFile:{
    type:String, // cloudinary
    required: true
  },
  thumbnail: {
    type:String , // cloudinary url
    required: true,
  },
  description: {
    type:String , 
    required: true,
  },
  duration:{
    type:Number,
    required: true
  },
  views: {
    type:Number , 
     default:true
  },
  isPublished:{
    type:Boolean,
    default:true
  },
  owner:{
    type:Schema.Types.ObjectId,
    ref:"User"
  }

},{timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate) //we can now write complex query

export const Video = mongoose.model("Video" , videoSchema)