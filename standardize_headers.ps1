$header = @"
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="js/share-utils.js?v=v_spa_fixed_v2"></script>
    <script src="js/main.js?v=v_spa_fixed_v2"></script>
    <script src="js/notifications.js?v=v_spa_fixed_v2"></script>
    <script src="https://cdn.jsdelivr.net/npm/nprogress@0.2.0/nprogress.min.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/nprogress@0.2.0/nprogress.css">
    <link rel="stylesheet" href="css/style.css?v=v_spa_fixed_v2">
"@

$files = Get-ChildItem *.html
foreach ($file in $files) {
    if ($file.Name -eq "sadaqah_backup.html") { continue }
    
    $content = Get-Content $file.FullName -Raw
    
    # Target the specific block we created in the last step
    # It starts with sweetalert2@11 and ends with style.css?v=v_spa_fixed_v2
    $pattern = '(?s)\s+<script src="https://cdn\.jsdelivr\.net/npm/sweetalert2@11"></script>.*?<link rel="stylesheet" href="css/style\.css\?v=v_spa_fixed_v2">'
    
    if ($content -match $pattern) {
        $newContent = $content -replace $pattern, "`n$header"
        $newContent | Set-Content $file.FullName
        Write-Host "Updated $($file.Name)"
    }
    else {
        # If it didn't match our new header, maybe it's still in the old state or missing something
        # Try a fallback pattern to find ANY main.js and style.css block
        $fallbackPattern = '(?s)\s+<script src=".*?main\.js.*?></script>.*?<link rel="stylesheet" href=".*?style\.css.*?">'
        if ($content -match $fallbackPattern) {
            $newContent = $content -replace $fallbackPattern, "`n$header"
            $newContent | Set-Content $file.FullName
            Write-Host "Updated $($file.Name) (fallback)"
        }
        else {
            Write-Host "Skipped $($file.Name) - No pattern found"
        }
    }
}
