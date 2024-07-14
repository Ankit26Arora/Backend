import mongoose, {Schema} from "mongoose";

const videoModel=new Schema(
    {
        videotype:{
            typeof:String,
        },
        thumbnail:{
            typeof:String
        },
        title:{
            typeof:String,
            required:true
        },
        owner:{
            typeof:Schema.Types.ObjectId,
            ref:'User',
            required:true,
        },
        descrption:{
            typeof:String,
            required:true
        },
        duration:{
            typeof:Number,
        },
        views:{
            typeof:Number,
            default:0
        },
        ispublished:{
            typeof:Boolean
        }
    },
    {
        timestamps:true
    }
)


export const Video = mongoose.model("Video",videoModel)