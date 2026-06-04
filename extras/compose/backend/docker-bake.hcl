group "default" {
  targets = ["hardened"]
  # targets = ["hardened", "trixie", "alpine"]
}
target "hardened" {
  tags = ["docker.io/juergenzimmermann/buch:2026.4.1-hardened"]
  #dockerfile = "Dockerfile"
  #no-cache = true
}

target "trixie" {
  tags = ["docker.io/juergenzimmermann/buch:2026.4.1-trixie"]
  dockerfile = "Dockerfile.trixie"
}

target "alpine" {
  tags = ["docker.io/juergenzimmermann/buch:2026.4.1-alpine"]
  dockerfile = "Dockerfile.alpine"
}
