import '../../shim.js'
import { createHash, createCipheriv, createDecipheriv } from 'crypto';

export function encrypt (plainText, workingKey) {
	console.log("Encrypting: ", plainText, " : ", workingKey)
	var m = createHash('md5');
	m.update(workingKey);

	var key = m.digest('binary');
	var keyBuffer = new Buffer(key, 'binary');
	var iv = '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f';

	var cipher = createCipheriv('aes-128-cbc', keyBuffer, iv);
	var encoded = cipher.update(plainText, 'utf8', 'hex');
	encoded += cipher.final('hex');

	console.log("Encrypted: ", encoded.toString())
	return encoded;
}


export function decrypt (encText, workingKey) {
	var m = createHash('md5');
	m.update(workingKey)
	var key = m.digest('binary');
	var keyBuffer = new Buffer(key, 'binary');
	var iv = '\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f';
	var decipher = createDecipheriv('aes-128-cbc', keyBuffer, iv);
	var decoded = decipher.update(encText, 'hex', 'utf8');
	decoded += decipher.final('utf8');
	return decoded;
}