# Script de renommage de fichiers

import os

# Chemin du fichier
path = "./"

# Récupération de la liste des fichiers
files = os.listdir(path)

# Parcours de la liste des fichiers
for file in files:
    # Récupération de l'extension du fichier
    ext = os.path.splitext(file)[1]

    # Renommage du fichier poke_capture_0005_000_mf_n_00000000_f_n.png
    if file.startswith("poke_capture_"):
        # Récupération du numéro du pokémon
        num = file.split("_")[2]


        # Ajout de shiny en cas de _r dans le nom du fichier comme par exemple poke_capture_0012_000_md_n_00000000_f_r.png
        if "_r" in file:
            num += "_shiny"

        # Ajout de form1 en cas de poke_capture_0051_001_mf_n_00000000_f_n.png par exemple
        if "_001_" in file:
            num += "_form1"

        # Pour forme 2
        if "_002_" in file:
            num += "_form2"

        # Pour forme 3

        if "_003_" in file:
            num += "_form3" 

        # Fait un script pour n'importe quelle forme
        if "_004_" in file:
            num += "_form4"

        if "_005_" in file:
            num += "_form5"

        if "_006_" in file:
            num += "_form6"

        if "_007_" in file:
            num += "_form7"

        if "_008_" in file:
            num += "_form8"

        if "_009_" in file:
            num += "_form9"

         #Fais jusqu'a 50 directement
        if "_010_" in file:
            num += "_form10"

        if "_011_" in file:
            num += "_form11"

        if "_012_" in file:
            num += "_form12"

        if "_013_" in file:
            num += "_form13"

        if "_014_" in file:
            num += "_form14"

        if "_015_" in file:
            num += "_form15"

        if "_016_" in file:
            num += "_form16"

        if "_017_" in file:
            num += "_form17"

        if "_018_" in file:
            num += "_form18"

        if "_019_" in file:
            num += "_form19"

        if "_020_" in file:
            num += "_form20"

        if "_021_" in file:
            num += "_form21"

        if "_022_" in file:
            num += "_form22"

        if "_023_" in file:
            num += "_form23"

        if "_024_" in file:
            num += "_form24"

        if "_025_" in file:
            num += "_form25"

        if "_026_" in file:
            num += "_form26"

        if "_027_" in file:
            num += "_form27"

        if "_028_" in file:
            num += "_form28"

        if "_029_" in file:
            num += "_form29"

        if "_030_" in file:
            num += "_form30"

        if "_031_" in file:
            num += "_form31"

        if "_032_" in file:
            num += "_form32"

        if "_033_" in file:
            num += "_form33"

        if "_034_" in file:
            num += "_form34"

        # En cas de GMAX 
        if "_g_" in file:
            num += "_gmax"

        if "_fd_" in file:
            num += "_F"
        
        if "_md_" in file:
            num += "_M"

        # Renommage du fichier
        os.rename(file,num + ext)
        print("Renommage de " + file + " en poke_" + num + ext)
    
