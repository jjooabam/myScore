Add-Type -AssemblyName System.Drawing

function Make-Icon([int]$sz, [string]$path) {
    $bmp = New-Object System.Drawing.Bitmap $sz, $sz
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::FromArgb(15, 23, 42)) # Background
    
    # Inner circle
    $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(16, 185, 129))
    $g.FillEllipse($brush, [int]($sz*0.08), [int]($sz*0.08), [int]($sz*0.84), [int]($sz*0.84))
    
    # White center ball
    $whiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
    $g.FillEllipse($whiteBrush, [int]($sz*0.35), [int]($sz*0.35), [int]($sz*0.3), [int]($sz*0.3))
    
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

$dir = "C:\Users\jjooabum\.gemini\antigravity\scratch\golf-score-app"
Make-Icon 192 (Join-Path $dir "icon-192.png")
Make-Icon 512 (Join-Path $dir "icon-512.png")
Write-Host "Success"
