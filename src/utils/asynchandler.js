const asynchandler = (responsehandler) =>{
    (req,res,next)=>{
        Promise.resolve(responsehandler(req,res,next)).
        catch((error)=>{
            next.error
            console.log(error)
        })

    }

}

export default asynchandler 