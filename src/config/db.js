import mongoose from 'mongoose';

let cached = global.mongoose || {conn: null, promise: null};

export async function connectDB() {

    if (cached.conn) {
        return cached.conn;
    }
    
    if (!cached.promise) {
        const opts = {
        bufferCommands: false,
        };
    
        cached.promise = mongoose.connect(process.env.MONGODB_URI, opts).then((mongoose) => {
        return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        console.error('MongoDB connection error:', e);
    }
    return cached.conn;
}