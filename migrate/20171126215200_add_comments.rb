Sequel.migration do
  change do
    alter_table :ledger do
      add_column :comments, String
      add_index :comments
    end
  end
end
