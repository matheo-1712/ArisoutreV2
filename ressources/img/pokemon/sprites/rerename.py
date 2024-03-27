import os

def remove_prefix(directory):
    for filename in os.listdir(directory):
        if filename.startswith("poke_"):
            new_filename = filename.replace("poke_", "", 1)
            os.rename(os.path.join(directory, filename), os.path.join(directory, new_filename))
            print(f"Renamed {filename} to {new_filename}")

# Remplacez 'directory_path' par le chemin de votre répertoire contenant les images
directory_path = './'
remove_prefix(directory_path)
