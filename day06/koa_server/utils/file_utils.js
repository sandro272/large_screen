const fs = require('fs')
// 读取文件的工具方法
module.exports.getFileJsonData = (filePath) => {
	return new Promise((resolve, reject) => {
		fs.readFile(filePath, 'utf-8', (error, data) => {
			if(error) {
				// error存在表示读取文件失败
				reject(error)
			}else{
				// error不存在表示读取文件成功
				resolve(data)
			}
		})
	})
}