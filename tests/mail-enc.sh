:

if [ ! -f testccme.crt ]
then
	if [ ! -f testccme.key ]
	then
		# Generate a private key
		openssl genrsa -out testccme.key 2048
	fi

	# Show the public key
	echo "Public Key:"
	openssl rsa -in testccme.key -pubout

	if [ ! -f testccme.csr ]
	then
	# Create the CSR
	openssl req -new -key testccme.key -out testccme.csr
	fi

	# Create the self-signed certificate
	openssl x509 -req -days 365 -in testccme.csr -signkey testccme.key -out testccme.crt

#	rm testccme.csr

	# Show the details of the certificate
	echo "Details of the certificate:"
	openssl x509 -in testccme.crt -text
fi

openssl smime -sign -inkey testccme.key -in note.txt -signer testccme.crt -text \
    | openssl smime -encrypt -out mail.msg -from test@ccme.com -to test@ccme.com \
         -subject "Signed and Encrypted message" -des3 testccme.crt

SMTPFILE=msg-enc.txt

printf "EHLO hostname\r\n" > $SMTPFILE
printf "MAIL FROM: <test@ccme.com>\r\n" >> $SMTPFILE
printf "RCPT TO:   <test@ccme.com>\r\n" >> $SMTPFILE
printf "DATA\r\n" >> $SMTPFILE
printf "Date: " >> $SMTPFILE
date >> $SMTPFILE
cat mail.msg >> $SMTPFILE
printf ".\r\n" >> $SMTPFILE
printf "QUIT\r\n" >> $SMTPFILE

nc -v -c localhost 2525 < $SMTPFILE

