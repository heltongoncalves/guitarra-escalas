@echo off
setlocal enabledelayedexpansion

:: Se nenhum parâmetro for passado, usa o diretório atual onde o script está sendo executado
if "%~1"=="" (
    set "target_dir=%cd%"
) else (
    set "target_dir=%~1"
)

:: O arquivo de saída será gerado sempre no diretório atual da execução
set "output_file=%cd%\resumo_projeto.txt"

:: Remove o arquivo de saída anterior se ele já existir
if exist "%output_file%" del "%output_file%"

echo Escaneando o diretorio: "%target_dir%"
echo Salvando resumo em: "%output_file%"
echo.

:: Percorre a árvore de diretórios buscando as extensões de código e de imagem
for /R "%target_dir%" %%F in (*.js *.css *.html *.md *.png *.jpg *.jpeg *.gif) do (
    
    :: Evita que o script tente ler o próprio arquivo de saída caso ele seja gerado na mesma pasta
    if not "%%F"=="%output_file%" (
        
        echo *** [%%F] >> "%output_file%"
        
        :: Identifica se a extensão pertence a um arquivo de imagem
        set "is_image=0"
        if /I "%%~xF"==".png" set "is_image=1"
        if /I "%%~xF"==".jpg" set "is_image=1"
        if /I "%%~xF"==".jpeg" set "is_image=1"
        if /I "%%~xF"==".gif" set "is_image=1"
        
        if "!is_image!"=="1" (
            echo [Conteudo Binario de Imagem Omitido] >> "%output_file%"
        ) else (
            type "%%F" >> "%output_file%"
        )
        
        echo. >> "%output_file%"
        echo. >> "%output_file%"
    )
)

echo Resumo concluido com sucesso!
pause