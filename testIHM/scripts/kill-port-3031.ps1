# Libère le port 3031 en arrêtant le processus qui l'utilise (Windows)
$port = 3031
$connections = netstat -ano | findstr ":$port.*LISTENING"
if (-not $connections) {
  Write-Host "Aucun processus n'écoute sur le port $port."
  exit 0
}
$pids = @()
foreach ($line in $connections) {
  $parts = $line -split '\s+'
  $pid = $parts[-1]
  if ($pid -match '^\d+$' -and $pids -notcontains $pid) {
    $pids += $pid
  }
}
foreach ($pid in $pids) {
  $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
  if ($proc) {
    Write-Host "Arrêt du processus $pid ($($proc.ProcessName))..."
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Write-Host "Port $port libéré. Tu peux relancer: npm run dev"
  }
}
