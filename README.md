- Set key
```
curl --location 'http://localhost:5050/test' \
--header 'Content-Type: application/json' \
--data '{
    "hello": "world"
}'
```

- Get key
```
curl --location 'http://localhost:5050/test/hello'
```
