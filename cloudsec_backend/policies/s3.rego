package cloudsec.s3

default allow = true

# Rule: Bucket must not be public
violation[msg] {
  some bucket
  input.buckets[bucket].public == true
  msg := sprintf("S3 Bucket %s is publicly accessible", [bucket])
}
