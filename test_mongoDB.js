const mongoose = require('mongoose');

// 連接到 MongoDB Atlas
mongoose.connect('mongodb+srv://xup61i6u6:a2550943@cluster0.pxwiurn.mongodb.net/?retryWrites=true&w=majority');

// 定義 Schema 和模型
const Schema = mongoose.Schema;

const MyModelSchema = new Schema({
    name: String,
    value: String
});
const MyModelSchema1 = new Schema({
    sport :String,
    id: String
})
const MyModel = mongoose.model('MyModel', MyModelSchema);
const SportModel = mongoose.model('sport',MyModelSchema1)
// 創建並保存一個實例到數據庫
const saveInstance = async () => {
    try {
        const instance = new MyModel({name: 'Example', value: 'Data'});
        const doc = await instance.save();
        console.log('文檔保存成功:', doc);
    } catch (err) {
        console.error(err);
    } finally {
        // 確保在結束後關閉數據庫連接
        mongoose.connection.close();
    }
};

saveInstance();
